import { auth } from "@/lib/auth";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AccountForm } from "@/components/admin/AccountForm";

export const dynamic = "force-dynamic";

export default async function AdminAccountPage() {
  const session = await auth();

  return (
    <div className="max-w-md">
      <AdminPageHeader
        title="Account"
        description="Change the username and password you sign in with. Both require your current password."
      />
      <AccountForm username={session?.user?.username ?? ""} />
    </div>
  );
}
