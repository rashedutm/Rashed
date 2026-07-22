import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { EducationManager } from "@/components/admin/EducationManager";

export const dynamic = "force-dynamic";

export default async function AdminEducationPage() {
  const entries = await prisma.education.findMany({
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
  });

  return (
    <div className="max-w-2xl">
      <AdminPageHeader title="Education" description="Degrees, institutions and dates." />
      <EducationManager entries={entries} />
    </div>
  );
}
