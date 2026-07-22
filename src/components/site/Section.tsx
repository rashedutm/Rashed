import type { ReactNode } from "react";

/** Shared section frame: eyebrow label, serif title, and a hairline rule. */
export function Section({
  id,
  eyebrow,
  title,
  children,
}: {
  id?: string;
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="mx-auto max-w-7xl scroll-mt-24 px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
      <div className="mb-10 border-b border-[var(--hairline)] pb-5">
        <p className="text-accent mb-2 text-[11px] tracking-[0.18em] uppercase">{eyebrow}</p>
        <h2 className="font-display text-2xl tracking-tight sm:text-3xl">{title}</h2>
      </div>
      {children}
    </section>
  );
}
