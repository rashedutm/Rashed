import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDateRange } from "@/lib/utils";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DeleteButton } from "@/components/admin/CrudShell";
import { deleteExperience } from "@/actions/experience";

export const dynamic = "force-dynamic";

export default async function AdminExperiencePage() {
  const items = await prisma.experience.findMany({
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    include: { _count: { select: { bullets: true } } },
  });

  return (
    <div className="max-w-3xl">
      <AdminPageHeader
        title="Experience"
        description="Each role has its own page where you can edit its bullet points."
        action={
          <Link
            href="/admin/experience/new"
            className="bg-accent hover:bg-accent-hover rounded-full px-5 py-2.5 text-sm font-medium text-[#1A0F06] transition-colors"
          >
            Add role
          </Link>
        }
      />

      {items.length === 0 ? (
        <p className="text-muted text-[14px]">No experience entries yet.</p>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-card flex items-center justify-between gap-4 rounded-[var(--radius)] border border-[var(--hairline)] px-5 py-4"
            >
              <Link href={`/admin/experience/${item.id}`} className="group min-w-0 flex-1">
                <p className="group-hover:text-accent truncate text-[14px] font-medium transition-colors">
                  {item.role}
                </p>
                <p className="text-muted mt-0.5 truncate text-[12px]">
                  {item.company} · {formatDateRange(item.startDate, item.endDate, item.current)} ·{" "}
                  {item._count.bullets} bullet{item._count.bullets === 1 ? "" : "s"}
                </p>
              </Link>

              <div className="flex shrink-0 items-center gap-3">
                <Link
                  href={`/admin/experience/${item.id}`}
                  className="text-muted hover:text-accent text-[13px] transition-colors"
                >
                  Edit
                </Link>
                <DeleteButton action={deleteExperience} id={item.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
