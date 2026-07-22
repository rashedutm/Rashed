import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AwardsManager } from "@/components/admin/AwardsManager";

export const dynamic = "force-dynamic";

export default async function AdminAwardsPage() {
  const awards = await prisma.award.findMany({ orderBy: [{ sortOrder: "asc" }, { id: "asc" }] });

  return (
    <div className="max-w-2xl">
      <AdminPageHeader title="Awards" description="Competition results, placements and honours." />
      <AwardsManager awards={awards} />
    </div>
  );
}
