import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { LoginForm } from "@/components/admin/LoginForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect("/admin");

  return (
    <main className="relative flex flex-1 items-center justify-center overflow-hidden px-5 py-20">
      <div className="hero-glow" aria-hidden="true" />

      <div className="relative w-full max-w-sm">
        <div className="mb-8">
          <h1 className="font-display text-2xl tracking-tight">Admin sign in</h1>
          <p className="text-muted mt-2 text-[13px]">
            Manage your portfolio content. Only you can get past this screen.
          </p>
        </div>

        <LoginForm />
      </div>
    </main>
  );
}
