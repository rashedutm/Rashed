"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { initials, safeUrl } from "@/lib/utils";
import { PRIMARY_COLOR, type CategoryColor } from "@/lib/categories";
import { FittedMedia } from "./FittedMedia";

export type PosterProject = {
  slug: string;
  title: string;
  subtitle: string | null;
  thumbnailUrl: string | null;
  tech: { id: number; techName: string }[];
};

export function PosterCard({
  project,
  index = 0,
  accent = PRIMARY_COLOR,
}: {
  project: PosterProject;
  index?: number;
  accent?: CategoryColor;
}) {
  const reduceMotion = useReducedMotion();
  const thumb = safeUrl(project.thumbnailUrl);

  // Category colour drives the hover glow, the title hover, and the placeholder
  // gradient — so a card visibly belongs to its category.
  const style = {
    "--c": accent.base,
    "--c-glow": accent.glow,
    "--c-soft": accent.soft,
  } as CSSProperties;

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.3), ease: [0.22, 1, 0.36, 1] }}
      className="group h-full"
      style={style}
    >
      <Link
        href={`/project/${project.slug}`}
        className="bg-card flex h-full flex-col overflow-hidden rounded-[var(--radius)] border border-[color:var(--c)]/25 shadow-[0_10px_36px_-22px_var(--c-glow)] transition-[transform,box-shadow,border-color] duration-300 ease-out will-change-transform group-hover:-translate-y-1 group-hover:scale-[1.03] group-hover:border-[color:var(--c)]/70 group-hover:shadow-[0_22px_60px_-14px_var(--c-glow)] motion-reduce:transform-none motion-reduce:transition-none"
      >
        <div className="relative aspect-[16/10] overflow-hidden">
          {thumb ? (
            <FittedMedia src={thumb} zoomOnHover />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center"
              style={{
                background: `linear-gradient(140deg, color-mix(in srgb, ${accent.base} 26%, #141416) 0%, #141416 62%)`,
              }}
            >
              <span
                className="font-display text-4xl tracking-tight"
                style={{ color: `color-mix(in srgb, ${accent.base} 62%, transparent)` }}
              >
                {initials(project.title)}
              </span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0C]/75 via-transparent to-transparent" />
          {/* Colour bar keys the card to its category — always visible, and it
              grows to full brightness on hover. */}
          <div
            className="absolute inset-x-0 bottom-0 h-[3px] opacity-70 transition-opacity duration-300 group-hover:opacity-100"
            style={{ background: accent.base, boxShadow: `0 0 16px 1px ${accent.glow}` }}
          />
        </div>

        <div className="flex flex-1 flex-col gap-1.5 p-4">
          <h3 className="font-display text-[15px] leading-snug transition-colors duration-300 group-hover:text-[color:var(--c)]">
            {project.title}
          </h3>
          {project.subtitle && (
            <p className="text-muted line-clamp-2 text-[13px] leading-relaxed">{project.subtitle}</p>
          )}
          {project.tech.length > 0 && (
            <div className="mt-auto flex flex-wrap gap-1.5 pt-2.5">
              {project.tech.slice(0, 3).map((t) => (
                <span
                  key={t.id}
                  className="text-muted rounded-full border border-[var(--hairline)] px-2 py-0.5 text-[10px] tracking-wide uppercase"
                >
                  {t.techName}
                </span>
              ))}
              {project.tech.length > 3 && (
                <span className="text-muted px-1 py-0.5 text-[10px]">
                  +{project.tech.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
