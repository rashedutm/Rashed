import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProjectDetail } from "@/components/site/ProjectDetail";
import { SiteNav } from "@/components/site/SiteNav";
import { SiteFooter } from "@/components/site/Sections";
import { getProfile, getProjectBySlug } from "@/lib/data";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return { title: "Project not found" };

  return {
    title: project.title,
    description: project.subtitle ?? project.description.slice(0, 160),
  };
}

export default async function ProjectPage({ params }: PageProps) {
  const { slug } = await params;
  const [project, profile] = await Promise.all([getProjectBySlug(slug), getProfile()]);

  if (!project) notFound();

  return (
    <>
      {profile && <SiteNav />}

      <main className="flex-1 pt-28 pb-16 sm:pt-32">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <Link
            href="/#work"
            className="text-muted hover:text-accent mb-8 inline-flex items-center gap-2 text-sm transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M10 3L5 8l5 5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Back to work
          </Link>
        </div>

        <ProjectDetail project={project} />
      </main>

      {profile && <SiteFooter profile={profile} />}
    </>
  );
}
