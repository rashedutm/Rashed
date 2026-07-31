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

/**
 * Bulk-sets which skills appear as hero chips in one save: every checked id is
 * flagged, everything else is cleared. Lets the admin toggle the whole set and
 * save once, instead of editing skills one at a time.
 */
export async function updateHeroSkills(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireAdmin();

    const ids = formData
      .getAll("heroSkillIds")
      .map((v) => Number(v))
      .filter((n) => Number.isInteger(n) && n > 0);

    const ops = [prisma.skill.updateMany({ data: { heroHighlight: false } })];
    if (ids.length > 0) {
      ops.push(
        prisma.skill.updateMany({
          where: { id: { in: ids } },
          data: { heroHighlight: true },
        }),
      );
    }
    await prisma.$transaction(ops);

    revalidatePublic();
    return success(`Hero chips saved — ${ids.length} selected.`);
  } catch (error) {
    return toActionError(error, "Could not update the hero chips.");
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
