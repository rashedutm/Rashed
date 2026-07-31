import type { Metadata } from "next";
import Link from "next/link";
import { SiteNav } from "@/components/site/SiteNav";
import { Hero } from "@/components/site/Hero";
import { WorkSection } from "@/components/site/WorkSection";
import {
  About,
  Awards,
  EducationList,
  ExperienceList,
  Skills,
  SiteFooter,
} from "@/components/site/Sections";
import {
  getAwards,
  getEducation,
  getExperience,
  getHeroSkills,
  getProfile,
  getProjectShelves,
  getSkillsByCategory,
  getSocialLinks,
} from "@/lib/data";

// Always render from the database, so admin edits appear without a redeploy.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const profile = await getProfile();
  if (!profile) return { title: { absolute: "Rashed" } };

  return {
    // Tab title stays "Rashed"; the full name/headline is only used for the
    // richer social-share preview.
    title: { absolute: "Rashed" },
    description: profile.tagline,
    openGraph: {
      title: `${profile.name} — ${profile.headline}`,
      description: profile.tagline,
      type: "website",
    },
  };
}

export default async function HomePage() {
  const [profile, shelves, skills, heroSkills, experience, awards, education, socials] =
    await Promise.all([
      getProfile(),
      getProjectShelves(),
      getSkillsByCategory(),
      getHeroSkills(),
      getExperience(),
      getAwards(),
      getEducation(),
      getSocialLinks(),
    ]);

  if (!profile) return <EmptyState />;

  return (
    <>
      <SiteNav />

      <main className="flex-1">
        <Hero
          name={profile.name}
          headline={profile.headline}
          tagline={profile.tagline}
          availability={profile.availability}
          availabilitySize={profile.availabilitySize}
          email={profile.email}
          resumeUrl={profile.resumeUrl}
          heroVideoUrl={profile.heroVideoUrl}
          skills={heroSkills}
        />

        {shelves.length > 0 ? (
          <WorkSection shelves={shelves} />
        ) : (
          <p className="text-muted mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-12">
            No published projects yet.
          </p>
        )}

        <About profile={profile} />
        <Skills groups={skills} />
        <ExperienceList items={experience} />
        <Awards items={awards} />
        <EducationList items={education} />
      </main>

      <SiteFooter profile={profile} socials={socials} />
    </>
  );
}

/** Shown before the seed has run, so a fresh deploy explains itself. */
function EmptyState() {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-32">
      <div className="max-w-md text-center">
        <h1 className="font-display text-3xl tracking-tight">Nothing here yet</h1>
        <p className="text-muted mt-4 leading-relaxed">
          The database has no profile record. Run the seed script (
          <code className="text-accent">npm run db:seed</code>) or sign in and fill in your profile.
        </p>
        <Link
          href="/admin"
          className="bg-accent hover:bg-accent-hover mt-8 inline-block rounded-full px-6 py-3 text-sm font-medium text-[#1A0F06] transition-colors"
        >
          Go to admin
        </Link>
      </div>
    </main>
  );
}
