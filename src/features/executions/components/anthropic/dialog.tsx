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
import { useCredentialsByType } from "@/features/credentials/hooks/use-credentials";
import { CredentialType } from "@/generated/prisma";
import Image from "next/image";

export const AVAILABLE_MODELS = [
  "claude-haiku-4-5",
  "claude-sonnet-4-5",
  "claude-opus-4-1",
  "claude-opus-4-0",
  "claude-sonnet-4-0",
  "claude-3-7-sonnet-latest",
  "claude-3-5-haiku-latest",
] as const;

const formSchema = z.object({
  variableName: z
    .string()
    .min(1, { message: "Variable name is required" })
    .regex(/^[A-Za-z_$][A-Za-z0-9_$]*$/, {
      message:
        "Variable name must start with a letter or underscore and contains only letters, numbers and underscores.",
    }),
  credentialId: z.string().min(1, "Credential is required"),
  model: z.string().min(1, "Model is required"),
  systemPrompt: z.string().optional(),
  userPrompt: z.string().min(1, "User prompt is required"),
});

export type AnthropicFormValues = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitSetNodeData: (values: z.infer<typeof formSchema>) => void;
  defaultValues?: Partial<AnthropicFormValues>;
  nodeId: string;
}

export const AnthropicDialog = ({
  open,
  onOpenChange,
  onSubmitSetNodeData,
  defaultValues,
  nodeId,
}: Props) => {
  const { data: credentials, isLoading: isLoadingCredentials } =
    useCredentialsByType(CredentialType.ANTHROPIC);

  const queryClient = useQueryClient();
  const trpc = useTRPC();
  const updateExecutionNodeData = useUpdateExecutionNode();
  const workflowId = useAtomValue(workflowIdAtom);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      credentialId: defaultValues?.credentialId ?? "",
      variableName: defaultValues?.variableName ?? "",
      model: defaultValues?.model ?? AVAILABLE_MODELS[0],
      systemPrompt: defaultValues?.systemPrompt ?? "",
      userPrompt: defaultValues?.userPrompt ?? "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        credentialId: defaultValues?.credentialId ?? "",
        variableName: defaultValues?.variableName ?? "",
        model: defaultValues?.model ?? AVAILABLE_MODELS[0],
        systemPrompt: defaultValues?.systemPrompt ?? "",
        userPrompt: defaultValues?.userPrompt ?? "",
      });
    }
  }, [open, defaultValues, form]);

  const watchVariableName = form.watch("variableName") || "myAnthropic";

  const handleSubmit = (values: AnthropicFormValues) => {
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
          toast.success("Anthropic node updated successfully.");
          onSubmitSetNodeData(values);
          onOpenChange(false);
          queryClient.invalidateQueries(
            trpc.workflows.getOne.queryOptions({ id: workflowId })
          );
        },
        onError: (error) => {
          toast.error(`Failed to update Anthropic node: ${error.message}`);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Anthropic Configuration</DialogTitle>
          <DialogDescription>
            Configure settings for the Anthropic node. Use this node to interact
            with Anthropic AI for generating text, answering questions, or
            performing advanced AI tasks.
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
                      <Input placeholder="myAnthropic" {...field} />
                    </FormControl>
                    <FormDescription>
                      Use this name to reference the response of this Anthropic
                      node: {`{{${watchVariableName}.text}}`}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="credentialId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Anthropic Credential</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isLoadingCredentials || !credentials?.length}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a credential" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {credentials?.map((credential) => (
                          <SelectItem key={credential.id} value={credential.id}>
                            <div className="flex items-center gap-2">
                              <Image
                                src="/node-logos/anthropic.svg"
                                alt="Anthropic"
                                width={16}
                                height={16}
                              />
                              {credential.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                      The Anthropic model to use for completion
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
