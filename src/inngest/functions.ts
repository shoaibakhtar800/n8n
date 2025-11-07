import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createHuggingFace } from "@ai-sdk/huggingface";
import { createOpenAI } from "@ai-sdk/openai";
import { inngest } from "./client";

const google = createGoogleGenerativeAI();
const openai = createOpenAI();
const anthropic = createAnthropic();
const huggingface = createHuggingFace();

export const executeWorkflow = inngest.createFunction(
  { id: "execute-workflow" },
  { event: "workflows/execute.workflow" },
  async ({ event, step }) => {
  
    await step.sleep("test", "5s");

    // const { steps: huggingfaceSteps } = await step.ai.wrap(
    //   "huggingface-generate-text",
    //   generateText,
    //   {
    //     system:
    //       "You are a helpful assistant that helps users with their requests.",
    //     model: huggingface("deepseek-ai/DeepSeek-R1"),
    //     prompt: "What is the capital of France?",
    //     experimental_telemetry: {
    //       isEnabled: true,
    //       recordInputs: true,
    //       recordOutputs: true,
    //     },
    //   }
    // );
  }
);
