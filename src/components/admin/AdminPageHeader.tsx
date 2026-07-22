import Link from "next/link";
import type { ReactNode } from "react";

export function AdminPageHeader({
  title,
  description,
  action,
  backHref,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  backHref?: string;
}) {
  return (
    <header className="mb-8 border-b border-[var(--hairline)] pb-6">
      {backHref && (
        <Link
          href={backHref}
          className="text-muted hover:text-accent mb-3 inline-block text-[13px] transition-colors"
        >
          ← Back
        </Link>
      )}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl tracking-tight sm:text-3xl">{title}</h1>
          {description && (
            <p className="text-muted mt-2 max-w-xl text-[14px] leading-relaxed">{description}</p>
          )}
        </div>
        {action}
      </div>
    </header>
  );
}
