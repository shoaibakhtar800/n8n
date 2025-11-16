"use server";

import { huggingfaceChannel as huggingfaceChannel } from "@/inngest/channels/huggingface";
import { inngest } from "@/inngest/client";
import { getSubscriptionToken, type Realtime } from "@inngest/realtime";

export type HuggingfaceToken = Realtime.Token<
  typeof huggingfaceChannel,
  ["status"]
>;

export async function fetchHuggingfaceRealtimeToken(): Promise<HuggingfaceToken> {
  const token = await getSubscriptionToken(inngest, {
    channel: huggingfaceChannel(),
    topics: ["status"],
  });

  return token;
}
