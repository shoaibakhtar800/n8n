"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { workflowIdAtom } from "@/features/editor/store/atoms";
import { useUpdateExecutionNode } from "@/features/workflows/hooks/use-workflows";
import { useTRPC } from "@/trpc/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

const formSchema = z.object({
  variableName: z
    .string()
    .min(1, { message: "Variable name is required" })
    .regex(/^[A-Za-z_$][A-Za-z0-9_$]*$/, {
      message:
        "Variable name must start with a letter or underscore and contains only letters, numbers and underscores.",
    }),
  content: z.string().min(1, "Message content is required"),
  webhookUrl: z.string().min(1, "Webhook URL is required"),
});

export type SlackFormValues = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitSetNodeData: (values: z.infer<typeof formSchema>) => void;
  defaultValues?: Partial<SlackFormValues>;
  nodeId: string;
}

export const SlackDialog = ({
  open,
  onOpenChange,
  onSubmitSetNodeData,
  defaultValues,
  nodeId,
}: Props) => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();
  const updateExecutionNodeData = useUpdateExecutionNode();
  const workflowId = useAtomValue(workflowIdAtom);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      variableName: defaultValues?.variableName ?? "",
      content: defaultValues?.content ?? "",
      webhookUrl: defaultValues?.webhookUrl ?? "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        variableName: defaultValues?.variableName ?? "",
        content: defaultValues?.content ?? "",
        webhookUrl: defaultValues?.webhookUrl ?? "",
      });
    }
  }, [open, defaultValues, form]);

  const watchVariableName = form.watch("variableName") || "mySlack";

  const handleSubmit = (values: SlackFormValues) => {
    if (!workflowId) {
      toast.error("Something went wrong. Please try again.");
      return;
    }

    if (!nodeId) {
      toast.error("Node ID is missing. Please try again.");
      return;
    }

    updateExecutionNodeData.mutate(
      {
        id: nodeId,
        workflowId,
        data: {
          ...values,
        },
      },
      {
        onSuccess: () => {
          toast.success("Slack node updated successfully.");
          onSubmitSetNodeData(values);
          onOpenChange(false);
          queryClient.invalidateQueries(
            trpc.workflows.getOne.queryOptions({ id: workflowId })
          );
        },
        onError: (error) => {
          toast.error(`Failed to update Slack node: ${error.message}`);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Slack Configuration</DialogTitle>
          <DialogDescription>
            Configure settings for the Slack node. Use this node to send
            messages, receive events, and enable AI-powered interactions within
            your Slack workspace.
          </DialogDescription>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="variableName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Variable Name</FormLabel>
                    <FormControl>
                      <Input placeholder="mySlack" {...field} />
                    </FormControl>
                    <FormDescription>
                      Use this name to reference the response of this Slack
                      node: {`{{${watchVariableName}.text}}`}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="webhookUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Webhook URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://hooks.slack.com/services/..."
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Get this from Slack: Workspace Settings &#8594;
                      Workflows &#8594; Webhooks
                    </FormDescription>
                    <FormDescription>
                      Make sure you have "content" variable
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message Content</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Summary: {{myGemini.text}}"
                        className="min-h-[80px] font-mono text-sm resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      The message to send. Use {"{{variables}}"} for simple
                      values or {"{{json variables}}"} to stringify objects
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="mt-4">
                <Button
                  type="submit"
                  disabled={updateExecutionNodeData.isPending}
                >
                  Save
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};
