import type { NodeExecutor } from "@/features/executions/types";
import { deepseekChannel } from "@/inngest/channels/deepseek";
import { createHuggingFace } from '@ai-sdk/huggingface';
import { generateText } from "ai";
import Handlebars from "handlebars";
import { NonRetriableError } from "inngest";

Handlebars.registerHelper("json", (context) => {
  const stringified = JSON.stringify(context, null, 2);
  const safeString = new Handlebars.SafeString(stringified);

  return safeString;
});

type DeepseekData = {
  variableName?: string;
  model?: string;
  systemPrompt?: string;
  userPrompt?: string;
};

export const deepseekExecutor: NodeExecutor<DeepseekData> = async ({
  data,
  nodeId,
  context,
  step,
  publish,
}) => {
  try {
    await publish(
      deepseekChannel().status({
        nodeId,
        status: "loading",
      })
    );

    if (!data.variableName) {
      await publish(
        deepseekChannel().status({
          nodeId,
          status: "error",
        })
      );

      throw new NonRetriableError("Deepseek node: Variable name is missing");
    }

    if (!data.userPrompt) {
      await publish(
        deepseekChannel().status({
          nodeId,
          status: "error",
        })
      );

      throw new NonRetriableError("Deepseek node: User prompt is missing");
    }

    const systemPrompt = data.systemPrompt
      ? Handlebars.compile(data.systemPrompt)(context)
      : "You are a helpful assistant.";
    const userPrompt = Handlebars.compile(data.userPrompt)(context);

    const credentialValue = process.env.HUGGINGFACE_API_KEY;
    const deepseek = createHuggingFace({
      apiKey: credentialValue,
    });

    const { steps } = await step.ai.wrap("deepseek-generate-text", generateText, {
      model: deepseek(data.model || "deepseek-ai/DeepSeek-R1"),
      system: systemPrompt,
      prompt: userPrompt,
      experimental_telemetry: {
        isEnabled: true,
        recordInputs: true,
        recordOutputs: true,
      },
    });

    const text =
      steps[0].content[0].type === "text" ? steps[0].content[0].text : "";

    await publish(
      deepseekChannel().status({
        nodeId,
        status: "success",
      })
    );

    return {
      ...context,
      [data.variableName]: {
        text
      },
    };
  } catch (error) {
    await publish(
      deepseekChannel().status({
        nodeId,
        status: "error",
      })
    );

    throw error;
  }
};
