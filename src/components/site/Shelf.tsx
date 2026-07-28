"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PosterCard, type PosterProject } from "./PosterCard";
import { PRIMARY_COLOR, type CategoryColor } from "@/lib/categories";
import { cn } from "@/lib/utils";

/**
 * One Netflix-style horizontal row. Scrolls with snap points, hides its
 * scrollbar, and shows arrow controls only when there is actually overflow.
 */
export function Shelf({
  category,
  items,
  accent = PRIMARY_COLOR,
}: {
  category: string;
  items: PosterProject[];
  accent?: CategoryColor;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateArrows = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < maxScroll - 4);
  }, []);

  useEffect(() => {
    updateArrows();
    const el = trackRef.current;
    if (!el) return;

    el.addEventListener("scroll", updateArrows, { passive: true });
    const observer = new ResizeObserver(updateArrows);
    observer.observe(el);
    return () => {
      el.removeEventListener("scroll", updateArrows);
      observer.disconnect();
    };
  }, [updateArrows, items.length]);

  const scrollBy = (direction: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    // Roughly one "page" of cards, so paging feels predictable at any width.
    el.scrollBy({ left: direction * Math.round(el.clientWidth * 0.85), behavior: "smooth" });
  };

  if (items.length === 0) return null;

  return (
    <section className="group/shelf relative">
      <div className="mb-4 flex items-baseline justify-between px-5 sm:px-8 lg:px-12">
        <h2 className="font-display flex items-center gap-2.5 text-xl tracking-tight sm:text-2xl">
          <span
            className="h-4 w-1 rounded-full"
            style={{ background: accent.base }}
            aria-hidden="true"
          />
          {category}
        </h2>
        <span className="text-muted text-xs tabular-nums">
          {items.length} {items.length === 1 ? "project" : "projects"}
        </span>
      </div>

      <div className="relative">
        <ShelfArrow
          side="left"
          visible={canScrollLeft}
          onClick={() => scrollBy(-1)}
          label={`Scroll ${category} left`}
        />
        <ShelfArrow
          side="right"
          visible={canScrollRight}
          onClick={() => scrollBy(1)}
          label={`Scroll ${category} right`}
        />

        <div
          ref={trackRef}
          className="hide-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-5 pt-1 pb-6 sm:px-8 lg:px-12"
        >
          {items.map((project, i) => (
            <div
              key={project.slug}
              className="w-[248px] shrink-0 snap-start sm:w-[286px] lg:w-[310px]"
            >
              <PosterCard project={project} index={i} accent={accent} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ShelfArrow({
  side,
  visible,
  onClick,
  label,
}: {
  side: "left" | "right";
  visible: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      tabIndex={visible ? 0 : -1}
      className={cn(
        "bg-elevated/80 text-muted hover:text-accent absolute top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--hairline)] backdrop-blur-md transition-all duration-300 hover:border-[var(--hairline-strong)] md:flex",
        side === "left" ? "left-3" : "right-3",
        visible
          ? "opacity-0 group-hover/shelf:opacity-100 focus-visible:opacity-100"
          : "pointer-events-none opacity-0",
      )}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path
          d={side === "left" ? "M10 3L5 8l5 5" : "M6 3l5 5-5 5"}
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
