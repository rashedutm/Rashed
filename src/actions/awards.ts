"use server";

import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { awardSchema, idSchema } from "@/lib/validation";
import {
  type ActionState,
  invalid,
  revalidatePublic,
  success,
  toActionError,
} from "@/lib/action-utils";

export async function saveAward(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    await requireAdmin();

    const parsed = awardSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) return invalid(parsed.error);

    const data = {
      ...parsed.data,
      place: parsed.data.place ?? null,
      result: parsed.data.result ?? null,
      date: parsed.data.date ?? null,
    };

    const rawId = formData.get("id");
    if (rawId) {
      await prisma.award.update({ where: { id: idSchema.parse(rawId) }, data });
    } else {
      await prisma.award.create({ data });
    }

    revalidatePublic();
    return success(rawId ? "Award updated." : "Award added.");
  } catch (error) {
    return toActionError(error, "Could not save the award.");
  }
}

export async function deleteAward(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    await requireAdmin();
    await prisma.award.delete({ where: { id: idSchema.parse(formData.get("id")) } });
    revalidatePublic();
    return success("Award deleted.");
  } catch (error) {
    return toActionError(error, "Could not delete the award.");
  }
}
