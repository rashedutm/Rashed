import { z } from "zod";

/** Trims, then turns "" into undefined so optional DB columns stay NULL. */
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((v) => (v === "" ? undefined : v))
    .optional();

/**
 * Optional URL field. Accepts only http(s) — this value ends up in `href` and
 * `src` attributes, so allowing `javascript:` or `data:` would be an XSS hole.
 */
const optionalUrl = (max = 500) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((v) => (v === "" ? undefined : v))
    .optional()
    .refine(
      (v) => {
        if (!v) return true;
        try {
          const { protocol } = new URL(v);
          return protocol === "http:" || protocol === "https:";
        } catch {
          return false;
        }
      },
      { message: "Must be a full http(s) URL (e.g. https://…)" },
    );

const requiredText = (max: number, label = "This field") =>
  z.string().trim().min(1, `${label} is required`).max(max);

const sortOrder = z.coerce.number().int().min(0).max(100_000).default(0);
const checkbox = z
  .union([z.boolean(), z.literal("on"), z.literal("true"), z.literal("false"), z.literal("")])
  .transform((v) => v === true || v === "on" || v === "true")
  .default(false);

export const idSchema = z.coerce.number().int().positive();

export const profileSchema = z.object({
  name: requiredText(191, "Name"),
  headline: requiredText(255, "Headline"),
  tagline: requiredText(255, "Tagline"),
  bio: requiredText(5000, "Bio"),
  aboutMe: requiredText(5000, "About me"),
  email: z.string().trim().max(191).pipe(z.email("Enter a valid email address")),
  phone: requiredText(64, "Phone"),
  location: requiredText(191, "Location"),
  githubUrl: optionalUrl(),
  linkedinUrl: optionalUrl(),
  profileImageUrl: optionalUrl(),
  resumeUrl: optionalUrl(),
  heroVideoUrl: optionalUrl(),
  availability: optionalText(255),
  availabilitySize: z.enum(["sm", "md", "lg"]).default("md"),
});

export const skillSchema = z.object({
  category: requiredText(191, "Category"),
  name: requiredText(191, "Skill name"),
  sortOrder,
  // heroHighlight is intentionally not here — it's managed only by the bulk
  // "Hero chips" panel (updateHeroSkills), so editing a skill never changes it.
});

export const experienceSchema = z.object({
  company: requiredText(191, "Company"),
  role: requiredText(191, "Role"),
  location: optionalText(191),
  startDate: requiredText(64, "Start date"),
  endDate: optionalText(64),
  current: checkbox,
  sortOrder,
  bullets: z.array(z.string().trim().max(2000)).default([]),
});

export const projectSchema = z.object({
  title: requiredText(191, "Title"),
  subtitle: optionalText(255),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .max(191)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens only"),
  category: requiredText(191, "Category"),
  description: requiredText(20_000, "Description"),
  role: optionalText(255),
  thumbnailUrl: optionalUrl(),
  videoUrl: optionalUrl(),
  liveUrl: optionalUrl(),
  repoUrl: optionalUrl(),
  featured: checkbox,
  status: z.enum(["draft", "published"]).default("published"),
  sortOrder,
  tech: z.array(z.string().trim().max(191)).default([]),
  features: z.array(z.string().trim().max(2000)).default([]),
  gallery: z
    .array(
      z.object({
        url: z.string().trim().max(500),
        caption: z.string().trim().max(255).optional(),
      }),
    )
    .default([]),
});

export const awardSchema = z.object({
  title: requiredText(191, "Title"),
  place: optionalText(191),
  result: optionalText(191),
  date: optionalText(64),
  sortOrder,
});

export const educationSchema = z.object({
  institution: requiredText(191, "Institution"),
  degree: requiredText(191, "Degree"),
  location: optionalText(191),
  startDate: requiredText(64, "Start date"),
  endDate: optionalText(64),
  current: checkbox,
  sortOrder,
});

export const accountSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(3, "Username must be at least 3 characters")
      .max(191)
      .regex(/^[a-zA-Z0-9._-]+$/, "Letters, numbers, dots, underscores and hyphens only"),
    currentPassword: z.string().min(1, "Enter your current password").max(200),
    newPassword: z
      .union([z.string().min(8, "New password must be at least 8 characters").max(200), z.literal("")])
      .optional(),
    confirmPassword: z.string().max(200).optional(),
  })
  .refine((d) => !d.newPassword || d.newPassword === d.confirmPassword, {
    message: "New passwords do not match",
    path: ["confirmPassword"],
  });

export type ProfileInput = z.infer<typeof profileSchema>;
export type SkillInput = z.infer<typeof skillSchema>;
export type ExperienceInput = z.infer<typeof experienceSchema>;
export type ProjectInput = z.infer<typeof projectSchema>;
export type AwardInput = z.infer<typeof awardSchema>;
export type EducationInput = z.infer<typeof educationSchema>;

/** "My Cool Project!" → "my-cool-project" */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(new RegExp("[\\u0300-\\u036f]", "g"), "") // strip combining accents
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 191);
}
