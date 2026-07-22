import { prisma } from "@/lib/prisma";
import { ProfileForm } from "@/components/admin/ProfileForm";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export const dynamic = "force-dynamic";

export default async function AdminProfilePage() {
  const profile = await prisma.profile.findFirst({ orderBy: { id: "asc" } });

  return (
    <div className="max-w-2xl">
      <AdminPageHeader
        title="Profile / About"
        description="Drives the hero, the About section and the footer. There is only ever one profile record."
      />
      <ProfileForm profile={profile} />
    </div>
  );
}
