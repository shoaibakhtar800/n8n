import type { NodeExecutor } from "@/features/executions/types";
import Handlebars from "handlebars";
import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { NonRetriableError } from "inngest";
import { openAIChannel } from "@/inngest/channels/openai";
import prisma from "@/lib/db";

Handlebars.registerHelper("json", (context) => {
  const stringified = JSON.stringify(context, null, 2);
  const safeString = new Handlebars.SafeString(stringified);

  return safeString;
});

type OpenAIData = {
  variableName?: string;
  model?: string;
  systemPrompt?: string;
  credentialId?: string;
  userPrompt?: string;
};

export const openAIExecutor: NodeExecutor<OpenAIData> = async ({
  data,
  nodeId,
  context,
  step,
  publish,
  userId,
}) => {
  try {
    await publish(
      openAIChannel().status({
        nodeId,
        status: "loading",
      })
    );

    if (!data.variableName) {
      await publish(
        openAIChannel().status({
          nodeId,
          status: "error",
        })
      );

      throw new NonRetriableError("OpenAI node: Variable name is missing");
    }

    if (!data.credentialId) {
      await publish(
        openAIChannel().status({
          nodeId,
          status: "error",
        })
      );

      throw new NonRetriableError("OpenAI node: Credential is required");
    }

    if (!data.userPrompt) {
      await publish(
        openAIChannel().status({
          nodeId,
          status: "error",
        })
      );

      throw new NonRetriableError("OpenAI node: User prompt is missing");
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
        openAIChannel().status({
          nodeId,
          status: "error",
        })
      );
      
      throw new NonRetriableError("OpenAI node: Credential not found");
    }

    const openAI = createOpenAI({
      apiKey: credential.value,
    });

    const { steps } = await step.ai.wrap("openai-generate-text", generateText, {
      model: openAI(data.model || "gpt-4.1"),
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
      openAIChannel().status({
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
      openAIChannel().status({
        nodeId,
        status: "error",
      })
    );

    throw error;
  }
};
