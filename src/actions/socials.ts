"use server";

import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { idSchema, socialLinkSchema } from "@/lib/validation";
import {
  type ActionState,
  invalid,
  revalidatePublic,
  success,
  toActionError,
} from "@/lib/action-utils";

export async function saveSocialLink(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireAdmin();

    const parsed = socialLinkSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) return invalid(parsed.error);

    const data = { ...parsed.data, label: parsed.data.label ?? null };

    const rawId = formData.get("id");
    if (rawId) {
      await prisma.socialLink.update({ where: { id: idSchema.parse(rawId) }, data });
    } else {
      await prisma.socialLink.create({ data });
    }

    revalidatePublic();
    return success(rawId ? "Link updated." : "Link added.");
  } catch (error) {
    return toActionError(error, "Could not save the link.");
  }
}

export async function deleteSocialLink(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireAdmin();
    await prisma.socialLink.delete({ where: { id: idSchema.parse(formData.get("id")) } });
    revalidatePublic();
    return success("Link deleted.");
  } catch (error) {
    return toActionError(error, "Could not delete the link.");
  }
}
