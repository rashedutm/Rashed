import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DeleteButton } from "@/components/admin/CrudShell";
import { deleteProject } from "@/actions/projects";

export const dynamic = "force-dynamic";

export default async function AdminProjectsPage() {
  const projects = await prisma.project.findMany({
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    include: { _count: { select: { tech: true, media: true } } },
  });

  const categories = [...new Set(projects.map((p) => p.category))];

  return (
    <div className="max-w-3xl">
      <AdminPageHeader
        title="Projects"
        description="Each category becomes one Netflix row on the home page. Featured projects also appear on the top shelf."
        action={
          <Link
            href="/admin/projects/new"
            className="bg-accent hover:bg-accent-hover rounded-full px-5 py-2.5 text-sm font-medium text-[#1A0F06] transition-colors"
          >
            Add project
          </Link>
        }
      />

      {categories.length > 0 && (
        <p className="text-muted mb-6 text-[12px]">
          Rows currently generated: <span className="text-text">{categories.join(" · ")}</span>
        </p>
      )}

      {projects.length === 0 ? (
        <p className="text-muted text-[14px]">No projects yet.</p>
      ) : (
        <div className="space-y-2">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-card flex items-center justify-between gap-4 rounded-[var(--radius)] border border-[var(--hairline)] px-5 py-4"
            >
              <Link href={`/admin/projects/${project.id}`} className="group min-w-0 flex-1">
                <p className="group-hover:text-accent flex items-center gap-2 truncate text-[14px] font-medium transition-colors">
                  {project.title}
                  {project.featured && (
                    <span className="text-accent border-accent/40 shrink-0 rounded-full border px-1.5 py-0.5 text-[10px] tracking-wide uppercase">
                      Featured
                    </span>
                  )}
                  {project.status === "draft" && (
                    <span className="text-muted shrink-0 rounded-full border border-[var(--hairline-strong)] px-1.5 py-0.5 text-[10px] tracking-wide uppercase">
                      Draft
                    </span>
                  )}
                </p>
                <p className="text-muted mt-0.5 truncate text-[12px]">
                  {project.category} · /{project.slug} · {project._count.tech} tech ·{" "}
                  {project._count.media} image{project._count.media === 1 ? "" : "s"}
                </p>
              </Link>

              <div className="flex shrink-0 items-center gap-3">
                <Link
                  href={`/admin/projects/${project.id}`}
                  className="text-muted hover:text-accent text-[13px] transition-colors"
                >
                  Edit
                </Link>
                <DeleteButton action={deleteProject} id={project.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
