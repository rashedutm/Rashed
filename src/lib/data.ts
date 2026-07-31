import "server-only";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

/**
 * Public read queries. Every one only ever returns published content, so
 * nothing in `draft` can leak onto the guest site.
 *
 * All reads are wrapped in `unstable_cache` with a shared "site" tag, so the
 * results are served from Next's Data Cache instead of hitting TiDB on every
 * request — pages load fast and the serverless DB is barely touched. Admin
 * mutations call `revalidateTag("site")`, so edits still appear immediately.
 */
export const SITE_TAG = "site";
const cacheOpts = { tags: [SITE_TAG], revalidate: 3600 };

export type ProfileData = Awaited<ReturnType<typeof getProfile>>;

export const getProfile = unstable_cache(
  () => prisma.profile.findFirst({ orderBy: { id: "asc" } }),
  ["profile"],
  cacheOpts,
);

export const getSkillsByCategory = unstable_cache(
  async () => {
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
  },
  ["skillsByCategory"],
  cacheOpts,
);

/**
 * Skills the admin has flagged to float as chips in the hero. Falls back to a
 * varied round-robin across all skills when nothing is flagged yet, so the hero
 * is never empty.
 */
export const getHeroSkills = unstable_cache(
  async (limit = 8): Promise<string[]> => {
    const flagged = await prisma.skill.findMany({
      where: { heroHighlight: true },
      orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
      take: limit,
      select: { name: true },
    });
    if (flagged.length > 0) return flagged.map((s) => s.name);

    // Fallback: one skill from each category in turn, for variety.
    const all = await prisma.skill.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { category: true, name: true },
    });
    const byCategory = new Map<string, string[]>();
    for (const s of all) {
      const list = byCategory.get(s.category);
      if (list) list.push(s.name);
      else byCategory.set(s.category, [s.name]);
    }
    const lists = [...byCategory.values()];
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
  },
  ["heroSkills"],
  cacheOpts,
);

export const getExperience = unstable_cache(
  () =>
    prisma.experience.findMany({
      orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
      include: { bullets: { orderBy: [{ sortOrder: "asc" }, { id: "asc" }] } },
    }),
  ["experience"],
  cacheOpts,
);

export const getAwards = unstable_cache(
  () => prisma.award.findMany({ orderBy: [{ sortOrder: "asc" }, { id: "asc" }] }),
  ["awards"],
  cacheOpts,
);

export const getEducation = unstable_cache(
  () => prisma.education.findMany({ orderBy: [{ sortOrder: "asc" }, { id: "asc" }] }),
  ["education"],
  cacheOpts,
);

// Internal, uncached — only used to compose the cached shelves below.
function fetchPublishedProjects() {
  return prisma.project.findMany({
    where: { status: "published" },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    include: { tech: { orderBy: [{ sortOrder: "asc" }, { id: "asc" }] } },
  });
}

export type PublicProject = Awaited<ReturnType<typeof fetchPublishedProjects>>[number];

/** Groups published projects into the Netflix-style rows, keyed by category. */
export const getProjectShelves = unstable_cache(
  async () => {
    const projects = await fetchPublishedProjects();

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
  },
  ["projectShelves"],
  cacheOpts,
);

export const getProjectBySlug = unstable_cache(
  (slug: string) =>
    prisma.project.findFirst({
      where: { slug, status: "published" },
      include: {
        tech: { orderBy: [{ sortOrder: "asc" }, { id: "asc" }] },
        features: { orderBy: [{ sortOrder: "asc" }, { id: "asc" }] },
        media: { orderBy: [{ sortOrder: "asc" }, { id: "asc" }] },
      },
    }),
  ["projectBySlug"],
  cacheOpts,
);
