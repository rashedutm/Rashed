"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { experienceSchema, idSchema } from "@/lib/validation";
import {
  type ActionState,
  invalid,
  repeatedStrings,
  revalidatePublic,
  success,
  toActionError,
} from "@/lib/action-utils";

export async function saveExperience(_prev: ActionState, formData: FormData): Promise<ActionState> {
  let redirectTo: string | null = null;

  try {
    await requireAdmin();

    const parsed = experienceSchema.safeParse({
      ...Object.fromEntries(formData),
      bullets: repeatedStrings(formData, "bullets"),
    });
    if (!parsed.success) return invalid(parsed.error);

    const { bullets, ...rest } = parsed.data;
    const data = {
      ...rest,
      location: rest.location ?? null,
      endDate: rest.current ? null : (rest.endDate ?? null),
    };

    const rawId = formData.get("id");
    if (rawId) {
      const id = idSchema.parse(rawId);
      // Bullets are fully owned by this form, so replace them wholesale rather
      // than trying to diff client-side ordering against the DB.
      await prisma.$transaction([
        prisma.experience.update({ where: { id }, data }),
        prisma.experienceBullet.deleteMany({ where: { experienceId: id } }),
        prisma.experienceBullet.createMany({
          data: bullets.map((text, i) => ({ experienceId: id, text, sortOrder: i })),
        }),
      ]);
    } else {
      const created = await prisma.experience.create({
        data: {
          ...data,
          bullets: { create: bullets.map((text, i) => ({ text, sortOrder: i })) },
        },
      });
      redirectTo = `/admin/experience/${created.id}`;
    }

    revalidatePublic();
  } catch (error) {
    return toActionError(error, "Could not save the experience entry.");
  }

  // redirect() throws internally, so it must sit outside the try/catch.
  if (redirectTo) redirect(redirectTo);
  return success("Experience saved.");
}

export async function deleteExperience(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireAdmin();
    // Bullets cascade via the FK relation.
    await prisma.experience.delete({ where: { id: idSchema.parse(formData.get("id")) } });
    revalidatePublic();
    return success("Experience deleted.");
  } catch (error) {
    return toActionError(error, "Could not delete the experience entry.");
  }
}
