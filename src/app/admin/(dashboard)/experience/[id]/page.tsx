import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ExperienceForm } from "@/components/admin/ExperienceForm";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ id: string }> };

export default async function ExperienceEditPage({ params }: PageProps) {
  const { id } = await params;

  if (id === "new") {
    const highest = await prisma.experience.findFirst({ orderBy: { sortOrder: "desc" } });
    return (
      <div className="max-w-2xl">
        <AdminPageHeader title="New role" backHref="/admin/experience" />
        <ExperienceForm nextSortOrder={(highest?.sortOrder ?? -1) + 1} />
      </div>
    );
  }

  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId <= 0) notFound();

  const experience = await prisma.experience.findUnique({
    where: { id: numericId },
    include: { bullets: { orderBy: [{ sortOrder: "asc" }, { id: "asc" }] } },
  });
  if (!experience) notFound();

  return (
    <div className="max-w-2xl">
      <AdminPageHeader title={experience.role} description={experience.company} backHref="/admin/experience" />
      <ExperienceForm experience={experience} />
    </div>
  );
}
