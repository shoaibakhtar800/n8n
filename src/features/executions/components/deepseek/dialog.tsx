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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { workflowIdAtom } from "@/features/editor/store/atoms";
import { useTRPC } from "@/trpc/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { useUpdateExecutionNode } from "../../hooks/use-executions";

export const AVAILABLE_MODELS = [
  "deepseek-ai/DeepSeek-R1",
  "deepseek-ai/DeepSeek-V3.1",
  "deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B",
  "deepseek-ai/DeepSeek-R1-Distill-Qwen-7B",
  "deepseek-ai/DeepSeek-R1-Distill-Qwen-14B",
  "deepseek-ai/DeepSeek-R1-Distill-Qwen-32B",
  "deepseek-ai/DeepSeek-R1-Distill-Llama-8B",
  "deepseek-ai/DeepSeek-R1-Distill-Llama-70B",
  "deepseek-ai/DeepSeek-Prover-V2-671B",
] as const;

const formSchema = z.object({
  variableName: z
    .string()
    .min(1, { message: "Variable name is required" })
    .regex(/^[A-Za-z_$][A-Za-z0-9_$]*$/, {
      message:
        "Variable name must start with a letter or underscore and contains only letters, numbers and underscores.",
    }),
  model: z.string().min(1, "Model is required"),
  systemPrompt: z.string().optional(),
  userPrompt: z.string().min(1, "User prompt is required"),
});

export type DeepseekFormValues = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitSetNodeData: (values: z.infer<typeof formSchema>) => void;
  defaultValues?: Partial<DeepseekFormValues>;
  nodeId: string;
}

export const DeepseekDialog = ({
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
      model: defaultValues?.model ?? AVAILABLE_MODELS[0],
      systemPrompt: defaultValues?.systemPrompt ?? "",
      userPrompt: defaultValues?.userPrompt ?? "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        variableName: defaultValues?.variableName ?? "",
        model: defaultValues?.model ?? AVAILABLE_MODELS[0],
        systemPrompt: defaultValues?.systemPrompt ?? "",
        userPrompt: defaultValues?.userPrompt ?? "",
      });
    }
  }, [open, defaultValues, form]);

  const watchVariableName = form.watch("variableName") || "myDeepseek";

  const handleSubmit = (values: DeepseekFormValues) => {
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
          toast.success("Deepseek node updated successfully.");
          onSubmitSetNodeData(values);
          onOpenChange(false);
          queryClient.invalidateQueries(
            trpc.workflows.getOne.queryOptions({ id: workflowId })
          );
        },
        onError: (error) => {
          toast.error(`Failed to update Deepseek node: ${error.message}`);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Deepseek Configuration</DialogTitle>
          <DialogDescription>
            Configure settings for the Deepseek node. Use this node to interact
            with Deepseek AI for generating text, answering questions, or
            performing advanced AI tasks.
          </DialogDescription>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-8 mt-4"
            >
              <FormField
                control={form.control}
                name="variableName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Variable Name</FormLabel>
                    <FormControl>
                      <Input placeholder="myDeepseek" {...field} />
                    </FormControl>
                    <FormDescription>
                      Use this name to reference the response of this Deepseek
                      node: {`{{${watchVariableName}.text}}`}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Model</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a model" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {AVAILABLE_MODELS.map((model) => (
                          <SelectItem key={model} value={model}>
                            {model}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      The Deepseek model to use for completion
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="systemPrompt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>System Prompt (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="You are a helpful assistant."
                        {...field}
                        className="min-h-[80px] font-mono text-sm resize-none"
                      />
                    </FormControl>
                    <FormDescription>
                      Sets the behaviour of the assistant. Use {"{{variables}}"}{" "}
                      for simple values or {"{{json variable}}"} to stringify
                      objects
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="userPrompt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>User Prompt</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Summarize this text: {{json httpResponse.data}}"
                        {...field}
                        className="min-h-[120px] font-mono text-sm resize-none"
                      />
                    </FormControl>
                    <FormDescription>
                      The prompt to send to the AI. Use {"{{variables}}"} for
                      simple values or {"{{json variable}}"} to stringify
                      objects
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
