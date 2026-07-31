import "server-only";
import { prisma } from "@/lib/prisma";

/**
 * Public read queries. Every one of these only ever returns published content,
 * so nothing in `draft` can leak onto the guest site.
 */

export type ProfileData = Awaited<ReturnType<typeof getProfile>>;

export function getProfile() {
  return prisma.profile.findFirst({ orderBy: { id: "asc" } });
}

export async function getSkillsByCategory() {
  const skills = await prisma.skill.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  // Preserve first-seen category order, which sortOrder already encodes.
  const grouped = new Map<string, typeof skills>();
  for (const skill of skills) {
    const list = grouped.get(skill.category);
    if (list) list.push(skill);
    else grouped.set(skill.category, [skill]);
  }
  return [...grouped.entries()].map(([category, items]) => ({ category, items }));
}

/**
 * Skills the admin has flagged to float as chips in the hero. Falls back to a
 * varied round-robin across all skills when nothing is flagged yet, so the hero
 * is never empty.
 */
export async function getHeroSkills(limit = 8): Promise<string[]> {
  const flagged = await prisma.skill.findMany({
    where: { heroHighlight: true },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    take: limit,
    select: { name: true },
  });
  if (flagged.length > 0) return flagged.map((s) => s.name);

  // Fallback: one skill from each category in turn, for variety.
  const groups = await getSkillsByCategory();
  const lists = groups.map((g) => g.items.map((i) => i.name));
  const out: string[] = [];
  for (let round = 0; out.length < limit; round++) {
    let added = false;
    for (const list of lists) {
      if (list[round]) {
        out.push(list[round]);
        added = true;
        if (out.length >= limit) break;
      }
    }
    if (!added) break;
  }
  return out;
}

export function getExperience() {
  return prisma.experience.findMany({
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    include: { bullets: { orderBy: [{ sortOrder: "asc" }, { id: "asc" }] } },
  });
}

export function getAwards() {
  return prisma.award.findMany({ orderBy: [{ sortOrder: "asc" }, { id: "asc" }] });
}

export function getEducation() {
  return prisma.education.findMany({ orderBy: [{ sortOrder: "asc" }, { id: "asc" }] });
}

export type PublicProject = Awaited<ReturnType<typeof getPublishedProjects>>[number];

export function getPublishedProjects() {
  return prisma.project.findMany({
    where: { status: "published" },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    include: { tech: { orderBy: [{ sortOrder: "asc" }, { id: "asc" }] } },
  });
}

/** Groups published projects into the Netflix-style rows, keyed by category. */
export async function getProjectShelves() {
  const projects = await getPublishedProjects();

  const shelves = new Map<string, PublicProject[]>();
  for (const project of projects) {
    const list = shelves.get(project.category);
    if (list) list.push(project);
    else shelves.set(project.category, [project]);
  }

  const featured = projects.filter((p) => p.featured);
  const rows = [...shelves.entries()].map(([category, items]) => ({ category, items }));

  // "Featured" leads, then every category row generated from the data.
  return featured.length > 0 ? [{ category: "Featured", items: featured }, ...rows] : rows;
}

export function getProjectBySlug(slug: string) {
  return prisma.project.findFirst({
    where: { slug, status: "published" },
    include: {
      tech: { orderBy: [{ sortOrder: "asc" }, { id: "asc" }] },
      features: { orderBy: [{ sortOrder: "asc" }, { id: "asc" }] },
      media: { orderBy: [{ sortOrder: "asc" }, { id: "asc" }] },
    },
  });
}
