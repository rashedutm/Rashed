import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { SocialsManager } from "@/components/admin/SocialsManager";

export const dynamic = "force-dynamic";

export default async function AdminSocialsPage() {
  const links = await prisma.socialLink.findMany({
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
  });

  return (
    <div className="max-w-2xl">
      <AdminPageHeader
        title="Contact & Socials"
        description="Links shown in the footer, each with its logo. Add GitHub, LinkedIn, a personal site, X, and more. Email, phone and location are set on the Profile page."
      />
      <SocialsManager links={links} />
    </div>
  );
}
