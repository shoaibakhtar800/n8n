import type { NodeExecutor } from "@/features/executions/types";
import { huggingfaceChannel } from "@/inngest/channels/huggingface";
import prisma from "@/lib/db";
import { decrypt } from "@/lib/encryption";
import { createHuggingFace } from "@ai-sdk/huggingface";
import { generateText } from "ai";
import Handlebars from "handlebars";
import { NonRetriableError } from "inngest";

Handlebars.registerHelper("json", (context) => {
  const stringified = JSON.stringify(context, null, 2);
  const safeString = new Handlebars.SafeString(stringified);

  return safeString;
});

type HuggingfaceData = {
  variableName?: string;
  model?: string;
  systemPrompt?: string;
  credentialId?: string;
  userPrompt?: string;
};

export const huggingfaceExecutor: NodeExecutor<HuggingfaceData> = async ({
  data,
  nodeId,
  context,
  step,
  publish,
  userId,
}) => {
  try {
    await publish(
      huggingfaceChannel().status({
        nodeId,
        status: "loading",
      })
    );

    if (!data.variableName) {
      await publish(
        huggingfaceChannel().status({
          nodeId,
          status: "error",
        })
      );

      throw new NonRetriableError(
        "Hugging Face node: Variable name is missing"
      );
    }

    if (!data.credentialId) {
      await publish(
        huggingfaceChannel().status({
          nodeId,
          status: "error",
        })
      );

      throw new NonRetriableError("Hugging Face node: Credential is required");
    }

    if (!data.userPrompt) {
      await publish(
        huggingfaceChannel().status({
          nodeId,
          status: "error",
        })
      );

      throw new NonRetriableError("Hugging Face node: User prompt is missing");
    }

    const systemPrompt = data.systemPrompt
      ? Handlebars.compile(data.systemPrompt)(context)
      : "You are a helpful assistant.";
    const userPrompt = Handlebars.compile(data.userPrompt)(context);

    const credential = await step.run("get-credential", () => {
      return prisma.credential.findUnique({
        where: {
          id: data.credentialId,
          userId
        },
        select: {
          value: true,
        },
      });
    });

    if (!credential) {
      await publish(
        huggingfaceChannel().status({
          nodeId,
          status: "error",
        })
      );

      throw new NonRetriableError("Hugging Face node: Credential not found");
    }

    const huggingface = createHuggingFace({
      apiKey: decrypt(credential.value),
    });

    const { steps } = await step.ai.wrap(
      "huggingface-generate-text",
      generateText,
      {
        model: huggingface(data.model || "deepseek-ai/DeepSeek-R1"),
        system: systemPrompt,
        prompt: userPrompt,
        experimental_telemetry: {
          isEnabled: true,
          recordInputs: true,
          recordOutputs: true,
        },
      }
    );

    const text =
      steps[0].content[0].type === "text" ? steps[0].content[0].text : "";

    await publish(
      huggingfaceChannel().status({
        nodeId,
        status: "success",
      })
    );

    return {
      ...context,
      [data.variableName]: {
        text,
      },
    };
  } catch (error) {
    await publish(
      huggingfaceChannel().status({
        nodeId,
        status: "error",
      })
    );

    throw error;
  }
};
