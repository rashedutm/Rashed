"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { idSchema, projectSchema, slugify } from "@/lib/validation";
import {
  type ActionState,
  invalid,
  repeatedStrings,
  revalidatePublic,
  success,
  toActionError,
} from "@/lib/action-utils";

/** Pairs up the repeatable gallery inputs, keeping only rows that have a URL. */
function galleryFrom(formData: FormData) {
  const urls = formData.getAll("galleryUrl").map((v) => (typeof v === "string" ? v.trim() : ""));
  const captions = formData
    .getAll("galleryCaption")
    .map((v) => (typeof v === "string" ? v.trim() : ""));

  return urls
    .map((url, i) => ({ url, caption: captions[i] || undefined }))
    .filter((item) => item.url.length > 0);
}

export async function saveProject(_prev: ActionState, formData: FormData): Promise<ActionState> {
  let redirectTo: string | null = null;

  try {
    await requireAdmin();

    const raw = Object.fromEntries(formData);
    const title = typeof raw.title === "string" ? raw.title : "";
    const slugInput = typeof raw.slug === "string" ? raw.slug.trim() : "";

    const parsed = projectSchema.safeParse({
      ...raw,
      // Blank slug falls back to one derived from the title.
      slug: slugInput || slugify(title),
      tech: repeatedStrings(formData, "tech"),
      features: repeatedStrings(formData, "features"),
      gallery: galleryFrom(formData),
    });
    if (!parsed.success) return invalid(parsed.error);

    const { tech, features, gallery, ...rest } = parsed.data;
    const data = {
      ...rest,
      subtitle: rest.subtitle ?? null,
      role: rest.role ?? null,
      thumbnailUrl: rest.thumbnailUrl ?? null,
      videoUrl: rest.videoUrl ?? null,
      liveUrl: rest.liveUrl ?? null,
      repoUrl: rest.repoUrl ?? null,
    };

    const children = {
      tech: { create: tech.map((techName, i) => ({ techName, sortOrder: i })) },
      features: { create: features.map((text, i) => ({ text, sortOrder: i })) },
      media: {
        create: gallery.map((item, i) => ({
          url: item.url,
          caption: item.caption ?? null,
          sortOrder: i,
        })),
      },
    };

    const rawId = formData.get("id");
    if (rawId) {
      const id = idSchema.parse(rawId);
      // Child rows are fully owned by this form — replace them in one transaction.
      await prisma.$transaction([
        prisma.projectTech.deleteMany({ where: { projectId: id } }),
        prisma.projectFeature.deleteMany({ where: { projectId: id } }),
        prisma.projectMedia.deleteMany({ where: { projectId: id } }),
        prisma.project.update({ where: { id }, data: { ...data, ...children } }),
      ]);
    } else {
      const created = await prisma.project.create({ data: { ...data, ...children } });
      redirectTo = `/admin/projects/${created.id}`;
    }

    revalidatePublic();
  } catch (error) {
    return toActionError(error, "Could not save the project.");
  }

  if (redirectTo) redirect(redirectTo);
  return success("Project saved.");
}

export async function deleteProject(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    await requireAdmin();
    // Tech, features and media cascade via their FK relations.
    await prisma.project.delete({ where: { id: idSchema.parse(formData.get("id")) } });
    revalidatePublic();
    return success("Project deleted.");
  } catch (error) {
    return toActionError(error, "Could not delete the project.");
  }
}
