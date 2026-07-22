import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const SECTIONS = [
  {
    href: "/admin/profile",
    title: "Profile / About",
    description: "Name, headline, bio, contact details, résumé and hero video.",
  },
  {
    href: "/admin/projects",
    title: "Projects",
    description: "The Netflix rows. Category drives which shelf a project lands in.",
  },
  { href: "/admin/skills", title: "Skills", description: "Grouped by category on the public site." },
  {
    href: "/admin/experience",
    title: "Experience",
    description: "Roles with dates and repeatable bullet points.",
  },
  { href: "/admin/awards", title: "Awards", description: "Competition results and placements." },
  { href: "/admin/education", title: "Education", description: "Degrees and institutions." },
  {
    href: "/admin/account",
    title: "Account",
    description: "Change your admin username and password.",
  },
];

export default async function AdminDashboard() {
  const [projects, published, featured, skills, experience, awards, education, profile] =
    await Promise.all([
      prisma.project.count(),
      prisma.project.count({ where: { status: "published" } }),
      prisma.project.count({ where: { featured: true } }),
      prisma.skill.count(),
      prisma.experience.count(),
      prisma.award.count(),
      prisma.education.count(),
      prisma.profile.findFirst({ orderBy: { id: "asc" } }),
    ]);

  const stats = [
    { label: "Projects", value: `${published}/${projects}`, hint: "published / total" },
    { label: "Featured", value: featured, hint: "on the top shelf" },
    { label: "Skills", value: skills, hint: "across all categories" },
    { label: "Experience", value: experience, hint: "roles" },
    { label: "Awards", value: awards, hint: "entries" },
    { label: "Education", value: education, hint: "entries" },
  ];

  return (
    <div className="max-w-4xl">
      <header className="mb-10">
        <h1 className="font-display text-3xl tracking-tight">
          {profile ? `Hello, ${profile.name.split(" ")[0]}` : "Welcome"}
        </h1>
        <p className="text-muted mt-2 text-[14px]">
          Everything on the public site is edited from here. Changes go live immediately — no
          redeploy needed.
        </p>
      </header>

      {!profile && (
        <div className="mb-10 rounded-[var(--radius)] border border-[var(--accent)]/40 bg-[var(--accent)]/10 px-4 py-3 text-[13px] text-[var(--accent)]">
          No profile record yet — <Link href="/admin/profile" className="underline">create one</Link>{" "}
          so the public site has something to show.
        </div>
      )}

      <div className="mb-12 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-card rounded-[var(--radius)] border border-[var(--hairline)] p-4"
          >
            <p className="text-muted text-[11px] tracking-[0.14em] uppercase">{stat.label}</p>
            <p className="font-display mt-2 text-2xl tabular-nums">{stat.value}</p>
            <p className="text-muted mt-0.5 text-[11px]">{stat.hint}</p>
          </div>
        ))}
      </div>

      <h2 className="text-muted mb-4 text-[11px] tracking-[0.16em] uppercase">Manage content</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {SECTIONS.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="bg-card group rounded-[var(--radius)] border border-[var(--hairline)] p-5 transition-colors hover:border-[var(--accent)]"
          >
            <h3 className="font-display group-hover:text-accent text-[15px] transition-colors">
              {section.title}
            </h3>
            <p className="text-muted mt-1.5 text-[13px] leading-relaxed">{section.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
