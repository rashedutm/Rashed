"use client";

import { type CSSProperties, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Shelf } from "./Shelf";
import { PosterCard, type PosterProject } from "./PosterCard";
import { paletteAt, PRIMARY_COLOR, type CategoryColor } from "@/lib/categories";
import { cn } from "@/lib/utils";

type ShelfData = { category: string; items: PosterProject[] };

const ALL = "All";

/**
 * The Work area, rebuilt around a category filter.
 *
 * Instead of forcing a visitor to scroll past every category to find the one
 * they care about, a sticky filter bar lets them jump straight to it — fewer
 * choices to act on at once (Hick's Law) and recognisable, colour-coded labels
 * (recognition over recall). "All" keeps the browsable Netflix rows as the
 * relaxed default; picking a category swaps to a compact grid with no
 * horizontal scrolling at all.
 */
export function WorkSection({ shelves }: { shelves: ShelfData[] }) {
  const reduce = useReducedMotion();
  const [active, setActive] = useState<string>(ALL);

  // Position in the shelf list == position in the palette, so a category's
  // colour never changes between the chip, the row header and its cards.
  const colorFor = useMemo(() => {
    const map = new Map<string, CategoryColor>();
    shelves.forEach((s, i) => map.set(s.category, s.category === "Featured" ? PRIMARY_COLOR : paletteAt(i)));
    return (category: string) => map.get(category) ?? PRIMARY_COLOR;
  }, [shelves]);

  // "Featured" repeats projects shown elsewhere, so the real total excludes it.
  const total = useMemo(
    () => shelves.filter((s) => s.category !== "Featured").reduce((n, s) => n + s.items.length, 0),
    [shelves],
  );

  const chips = [{ category: ALL, count: total }, ...shelves.map((s) => ({ category: s.category, count: s.items.length }))];
  const activeShelf = shelves.find((s) => s.category === active);

  return (
    <section id="work" className="scroll-mt-24 pt-6 pb-4">
      <div className="mx-auto mb-1 max-w-7xl px-5 sm:px-8 lg:px-12">
        <p className="text-accent text-[11px] tracking-[0.18em] uppercase">Selected work</p>
      </div>

      {/* Sticky filter bar — always within reach while scrolling the section. */}
      <div className="bg-base/70 sticky top-[57px] z-30 border-y border-[var(--hairline)] backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
          <div
            role="tablist"
            aria-label="Filter projects by category"
            className="hide-scrollbar flex gap-2 overflow-x-auto py-3"
          >
            {chips.map((chip) => {
              const isActive = active === chip.category;
              const color = chip.category === ALL ? PRIMARY_COLOR : colorFor(chip.category);
              const style = { "--c": color.base, "--c-soft": color.soft } as CSSProperties;

              return (
                <button
                  key={chip.category}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActive(chip.category)}
                  style={style}
                  className={cn(
                    "jelly flex shrink-0 items-center gap-2 rounded-full border px-4 py-1.5 text-[13px] font-medium whitespace-nowrap",
                    isActive
                      ? "border-[color:var(--c)] bg-[color:var(--c-soft)] text-[color:var(--c)] shadow-[0_4px_18px_-6px_var(--c)]"
                      : "border-[color:var(--c)]/30 text-[color:var(--c)]/85 hover:border-[color:var(--c)] hover:bg-[color:var(--c-soft)]",
                  )}
                >
                  {chip.category !== ALL && (
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ background: color.base }}
                      aria-hidden="true"
                    />
                  )}
                  {chip.category}
                  <span className="text-[10px] tabular-nums opacity-60">{chip.count}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <AnimatePresence mode="wait">
          {active === ALL ? (
            <motion.div
              key="all"
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduce ? undefined : { opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {shelves.map((shelf) => (
                <Shelf
                  key={shelf.category}
                  category={shelf.category}
                  items={shelf.items}
                  accent={colorFor(shelf.category)}
                />
              ))}
            </motion.div>
          ) : activeShelf ? (
            <motion.div
              key={active}
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12"
            >
              <div className="mb-5 flex items-baseline justify-between">
                <h2 className="font-display flex items-center gap-2.5 text-2xl tracking-tight">
                  <span
                    className="h-5 w-1 rounded-full"
                    style={{ background: colorFor(active).base }}
                    aria-hidden="true"
                  />
                  {active}
                </h2>
                <span className="text-muted text-xs tabular-nums">
                  {activeShelf.items.length}{" "}
                  {activeShelf.items.length === 1 ? "project" : "projects"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {activeShelf.items.map((project, i) => (
                  <PosterCard
                    key={project.slug}
                    project={project}
                    index={i}
                    accent={colorFor(active)}
                  />
                ))}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </section>
  );
}
