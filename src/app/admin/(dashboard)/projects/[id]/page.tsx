import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ProjectForm } from "@/components/admin/ProjectForm";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ id: string }> };

async function loadCategories() {
  const rows = await prisma.project.findMany({
    distinct: ["category"],
    select: { category: true },
    orderBy: { category: "asc" },
  });
  return rows.map((row) => row.category);
}

export default async function ProjectEditPage({ params }: PageProps) {
  const { id } = await params;

  if (id === "new") {
    const [highest, categories] = await Promise.all([
      prisma.project.findFirst({ orderBy: { sortOrder: "desc" } }),
      loadCategories(),
    ]);

    return (
      <div className="max-w-2xl">
        <AdminPageHeader title="New project" backHref="/admin/projects" />
        <ProjectForm categories={categories} nextSortOrder={(highest?.sortOrder ?? -1) + 1} />
      </div>
    );
  }

  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId <= 0) notFound();

  const [project, categories] = await Promise.all([
    prisma.project.findUnique({
      where: { id: numericId },
      include: {
        tech: { orderBy: [{ sortOrder: "asc" }, { id: "asc" }] },
        features: { orderBy: [{ sortOrder: "asc" }, { id: "asc" }] },
        media: { orderBy: [{ sortOrder: "asc" }, { id: "asc" }] },
      },
    }),
    loadCategories(),
  ]);
  if (!project) notFound();

  return (
    <div className="max-w-2xl">
      <AdminPageHeader
        title={project.title}
        description={`/project/${project.slug}`}
        backHref="/admin/projects"
      />
      <ProjectForm project={project} categories={categories} />
    </div>
  );
}
