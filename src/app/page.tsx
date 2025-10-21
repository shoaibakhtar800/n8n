import { requireAuth } from "@/lib/auth-utils";
import LogoutButton from "./logout-button";

const Page = async () => {
  await requireAuth();

  return (
    <div className="min-h-screen min-w-screen flex items-center justify-center">
      hello
      <LogoutButton />
    </div>
  );
};

export default Page;