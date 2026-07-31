"use server";

import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { profileSchema } from "@/lib/validation";
import {
  type ActionState,
  invalid,
  revalidatePublic,
  success,
  toActionError,
} from "@/lib/action-utils";

export async function saveProfile(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    await requireAdmin();

    const parsed = profileSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) return invalid(parsed.error);

    const data = {
      ...parsed.data,
      profileImageUrl: parsed.data.profileImageUrl ?? null,
      resumeUrl: parsed.data.resumeUrl ?? null,
      heroVideoUrl: parsed.data.heroVideoUrl ?? null,
      availability: parsed.data.availability ?? null,
    };

    // Profile is a single-row table: update the existing row or create the first.
    const existing = await prisma.profile.findFirst({ orderBy: { id: "asc" } });
    if (existing) {
      await prisma.profile.update({ where: { id: existing.id }, data });
    } else {
      await prisma.profile.create({ data });
    }

    revalidatePublic();
    return success("Profile saved.");
  } catch (error) {
    return toActionError(error, "Could not save the profile.");
  }
}
