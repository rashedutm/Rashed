"use server";

import { AuthError } from "next-auth";
import { z } from "zod";
import { signIn } from "@/lib/auth";
import { type ActionState, failure } from "@/lib/action-utils";

const loginSchema = z.object({
  username: z.string().trim().min(1, "Enter your username").max(191),
  password: z.string().min(1, "Enter your password").max(200),
});

export async function authenticate(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return failure("Enter your username and password.");
  }

  try {
    await signIn("credentials", { ...parsed.data, redirectTo: "/admin" });
  } catch (error) {
    // A successful sign-in redirects by throwing NEXT_REDIRECT, so only real
    // auth failures are handled here — everything else must bubble up.
    if (error instanceof AuthError) {
      return failure("Invalid username or password.");
    }
    throw error;
  }

  return { ok: true };
}
