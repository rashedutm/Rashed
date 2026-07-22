"use server";

import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { idSchema, skillSchema } from "@/lib/validation";
import {
  type ActionState,
  invalid,
  revalidatePublic,
  success,
  toActionError,
} from "@/lib/action-utils";

export async function saveSkill(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    await requireAdmin();

    const parsed = skillSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) return invalid(parsed.error);

    const rawId = formData.get("id");
    if (rawId) {
      const id = idSchema.parse(rawId);
      await prisma.skill.update({ where: { id }, data: parsed.data });
    } else {
      await prisma.skill.create({ data: parsed.data });
    }

    revalidatePublic();
    return success(rawId ? "Skill updated." : "Skill added.");
  } catch (error) {
    return toActionError(error, "Could not save the skill.");
  }
}

export async function deleteSkill(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    await requireAdmin();
    const id = idSchema.parse(formData.get("id"));
    await prisma.skill.delete({ where: { id } });
    revalidatePublic();
    return success("Skill deleted.");
  } catch (error) {
    return toActionError(error, "Could not delete the skill.");
  }
}
