import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { SkillsManager } from "@/components/admin/SkillsManager";

export const dynamic = "force-dynamic";

export default async function AdminSkillsPage() {
  const skills = await prisma.skill.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  return (
    <div className="max-w-2xl">
      <AdminPageHeader
        title="Skills"
        description="Grouped by category on the public site. Type the same category name to add a skill to an existing group."
      />
      <SkillsManager skills={skills} />
    </div>
  );
}
