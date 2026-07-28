import type { ReactNode } from "react";

/**
 * Shared section frame: a colour-keyed eyebrow label, serif title, and a
 * hairline rule. The `accent` colour ties each section to a consistent hue so
 * the page reads as a set of distinct, recognisable areas rather than one long
 * dark scroll.
 */
export function Section({
  id,
  eyebrow,
  title,
  accent = "var(--accent)",
  children,
}: {
  id?: string;
  eyebrow: string;
  title: string;
  accent?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className="relative mx-auto max-w-7xl scroll-mt-24 px-5 py-16 sm:px-8 sm:py-20 lg:px-12"
    >
      {/* Faint accent wash so the section carries its colour, never pure black. */}
      <div
        className="pointer-events-none absolute -top-6 left-0 h-64 w-[36rem] max-w-full opacity-60 blur-3xl"
        style={{
          background: `radial-gradient(ellipse at left, ${accent}22, transparent 70%)`,
        }}
        aria-hidden="true"
      />
      <div className="relative mb-10 border-b border-[var(--hairline)] pb-5">
        <p
          className="mb-2 flex items-center gap-2 text-[11px] tracking-[0.18em] uppercase"
          style={{ color: accent }}
        >
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: accent, boxShadow: `0 0 10px 1px ${accent}` }}
            aria-hidden="true"
          />
          {eyebrow}
        </p>
        <h2 className="font-display text-2xl tracking-tight sm:text-3xl">{title}</h2>
      </div>
      <div className="relative">{children}</div>
    </section>
  );
}
