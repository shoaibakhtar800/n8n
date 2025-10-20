"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

const Page = () => {
  const { data } = authClient.useSession();

  return (
    <div>
      {JSON.stringify(data)}
      <Button onClick={() => authClient.signOut()}>
        Logout
      </Button>
    </div>
  )
}

export default Page;