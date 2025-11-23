import type { NodeExecutor } from "@/features/executions/types";
import { anthropicChannel } from "@/inngest/channels/anthropic";
import prisma from "@/lib/db";
import { decrypt } from "@/lib/encryption";
import { createAnthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import Handlebars from "handlebars";
import { NonRetriableError } from "inngest";

Handlebars.registerHelper("json", (context) => {
  const stringified = JSON.stringify(context, null, 2);
  const safeString = new Handlebars.SafeString(stringified);

  return safeString;
});

type AnthropicData = {
  variableName?: string;
  model?: string;
  systemPrompt?: string;
  credentialId?: string;
  userPrompt?: string;
};

export const anthropicExecutor: NodeExecutor<AnthropicData> = async ({
  data,
  nodeId,
  context,
  step,
  publish,
  userId,
}) => {
  try {
    await publish(
      anthropicChannel().status({
        nodeId,
        status: "loading",
      })
    );

    if (!data.variableName) {
      await publish(
        anthropicChannel().status({
          nodeId,
          status: "error",
        })
      );

      throw new NonRetriableError("Anthropic node: Variable name is missing");
    }

    if (!data.credentialId) {
      await publish(
        anthropicChannel().status({
          nodeId,
          status: "error",
        })
      );

      throw new NonRetriableError("Anthropic node: Credential is required");
    }

    if (!data.userPrompt) {
      await publish(
        anthropicChannel().status({
          nodeId,
          status: "error",
        })
      );

      throw new NonRetriableError("Anthropic node: User prompt is missing");
    }

    const systemPrompt = data.systemPrompt
      ? Handlebars.compile(data.systemPrompt)(context)
      : "You are a helpful assistant.";
    const userPrompt = Handlebars.compile(data.userPrompt)(context);

    const credential = await step.run("get-credential", () => {
      return prisma.credential.findUnique({
        where: {
          id: data.credentialId,
          userId,
        },
        select: {
          value: true,
        },
      });
    });

    if (!credential) {
      await publish(
        anthropicChannel().status({
          nodeId,
          status: "error",
        })
      );

      throw new NonRetriableError("Anthropic node: Credential not found");
    }

    const anthropic = createAnthropic({
      apiKey: decrypt(credential.value),
    });

    const { steps } = await step.ai.wrap(
      "anthropic-generate-text",
      generateText,
      {
        model: anthropic(data.model || "claude-haiku-4-5"),
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
      anthropicChannel().status({
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
      anthropicChannel().status({
        nodeId,
        status: "error",
      })
    );

    throw error;
  }
};
