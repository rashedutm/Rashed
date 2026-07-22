"use server";

import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { educationSchema, idSchema } from "@/lib/validation";
import {
  type ActionState,
  invalid,
  revalidatePublic,
  success,
  toActionError,
} from "@/lib/action-utils";

export async function saveEducation(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    await requireAdmin();

    const parsed = educationSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) return invalid(parsed.error);

    const data = {
      ...parsed.data,
      location: parsed.data.location ?? null,
      endDate: parsed.data.current ? null : (parsed.data.endDate ?? null),
    };

    const rawId = formData.get("id");
    if (rawId) {
      await prisma.education.update({ where: { id: idSchema.parse(rawId) }, data });
    } else {
      await prisma.education.create({ data });
    }

    revalidatePublic();
    return success(rawId ? "Education updated." : "Education added.");
  } catch (error) {
    return toActionError(error, "Could not save the education entry.");
  }
}

export async function deleteEducation(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    await requireAdmin();
    await prisma.education.delete({ where: { id: idSchema.parse(formData.get("id")) } });
    revalidatePublic();
    return success("Education entry deleted.");
  } catch (error) {
    return toActionError(error, "Could not delete the education entry.");
  }
}
