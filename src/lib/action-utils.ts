import "server-only";
import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import type { ActionState } from "./action-state";
import { SITE_TAG } from "./data";

export type { ActionState };

/** Flattens a Zod error into the `{ field: message }` shape the forms render. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

export function invalid(error: z.ZodError): ActionState {
  return { ok: false, message: "Please fix the highlighted fields.", errors: fieldErrors(error) };
}

export function failure(message: string, errors?: Record<string, string>): ActionState {
  return { ok: false, message, errors };
}

export function success(message: string): ActionState {
  return { ok: true, message };
}

/**
 * Turns Prisma errors into something a human can act on, instead of leaking a
 * stack trace into the UI.
 */
export function toActionError(error: unknown, fallback: string): ActionState {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      const target = (error.meta?.target as string[] | undefined)?.join(", ") ?? "value";
      return failure(`That ${target} is already in use — pick another.`);
    }
    if (error.code === "P2025") {
      return failure("That record no longer exists — it may have been deleted already.");
    }
  }
  if (error instanceof Error && error.message === "Unauthorized") {
    return failure("Your session expired. Sign in again.");
  }
  console.error(error);
  return failure(fallback);
}

/** Refreshes every public surface that could be showing the changed content. */
export function revalidatePublic() {
  // Bust the cached DB reads (data.ts) and re-render the public routes.
  // updateTag is the Server-Action-scoped tag invalidation in Next 16.
  updateTag(SITE_TAG);
  revalidatePath("/", "layout");
}

/** Reads a repeatable field (e.g. multiple `bullets` inputs), dropping blanks. */
export function repeatedStrings(formData: FormData, key: string): string[] {
  return formData
    .getAll(key)
    .map((value) => (typeof value === "string" ? value.trim() : ""))
    .filter((value) => value.length > 0);
}
