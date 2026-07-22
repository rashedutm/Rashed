import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/lib/auth";
import { AdminNav } from "@/components/admin/AdminNav";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

/**
 * Guarded shell for every admin screen. `/admin/login` deliberately sits
 * outside this route group so it stays reachable while signed out.
 */
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  // The middleware already blocks these routes; this is defence in depth in
  // case a path ever slips past the matcher.
  if (!session?.user) redirect("/admin/login");

  async function handleSignOut() {
    "use server";
    await signOut({ redirectTo: "/admin/login" });
  }

  return (
    <div className="flex min-h-screen flex-1 flex-col lg:flex-row">
      <AdminNav username={session.user.username ?? "admin"} signOutAction={handleSignOut} />
      <main className="min-w-0 flex-1 px-5 py-8 sm:px-8 lg:px-12 lg:py-12">{children}</main>
    </div>
  );
}
