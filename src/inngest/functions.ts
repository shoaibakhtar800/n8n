import { inngest } from "./client";
import { generateText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createHuggingFace } from "@ai-sdk/huggingface";

const google = createGoogleGenerativeAI();
const openai = createOpenAI();
const anthropic = createAnthropic();
const huggingface = createHuggingFace();

export const execute = inngest.createFunction(
  { id: "execute" },
  { event: "execute/ai" },
  async ({ event, step }) => {
    const { steps: geminiSteps } = await step.ai.wrap(
      "gemini-generate-text",
      generateText,
      {
        system:
          "You are a helpful assistant that helps users with their requests.",
        model: google("gemini-2.5-flash"),
        prompt: "What is the capital of France?",
      }
    );

    const { steps: huggingfaceSteps } = await step.ai.wrap(
      "huggingface-generate-text",
      generateText,
      {
        system:
          "You are a helpful assistant that helps users with their requests.",
        model: huggingface("deepseek-ai/DeepSeek-R1"),
        prompt: "What is the capital of France?",
      }
    );

    const { steps: openaiSteps } = await step.ai.wrap(
      "openai-generate-text",
      generateText,
      {
        system:
          "You are a helpful assistant that helps users with their requests.",
        model: openai("gpt-3.5-turbo"),
        prompt: "What is the capital of France?",
      }
    );

    const { steps: anthropicSteps } = await step.ai.wrap(
      "anthropic-generate-text",
      generateText,
      {
        system:
          "You are a helpful assistant that helps users with their requests.",
        model: anthropic("claude-3-5-haiku-20241022"),
        prompt: "What is the capital of France?",
      }
    );

    return {
      geminiSteps,
      huggingfaceSteps,
      openaiSteps,
      anthropicSteps
    };
  }
);
