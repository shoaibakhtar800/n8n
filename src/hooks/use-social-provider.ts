import { authClient } from "@/lib/auth-client";
import { useState } from "react";
import { toast } from "sonner";

export const useSocialProvider = () => {
  const [loading, setLoading] = useState(false);

  const signIn = async (provider: "github" | "google") => {
    try {
      setLoading(true);
      await authClient.signIn.social({ provider });
    } catch (error: unknown) {
      const providerName = provider === "github" ? "GitHub" : "Google";
      if (error instanceof Error) {
        toast.error(`${providerName} sign-in failed: ${error.message}`);
      } else {
        toast.error(`${providerName} sign-in failed: Unknown error`);
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    gitHubSignIn: () => signIn("github"),
    googleSignIn: () => signIn("google"),
    loading,
  };
};
