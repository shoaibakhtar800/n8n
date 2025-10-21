"use client";

import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

const Page = () => {
  // await requireAuth();
  const trpc = useTRPC();

  const testAi = useMutation(trpc.testAI.mutationOptions());

  return (
    <div className="min-h-screen min-w-screen flex items-center justify-center">
      hello
      <Button disabled={testAi.isPending} onClick={() => testAi.mutate()}>
        Test AI
      </Button>
      {/* <LogoutButton /> */}
    </div>
  );
};

export default Page;