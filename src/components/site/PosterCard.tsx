"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { hueFromString, initials, safeUrl } from "@/lib/utils";

export type PosterProject = {
  slug: string;
  title: string;
  subtitle: string | null;
  thumbnailUrl: string | null;
  tech: { id: number; techName: string }[];
};

export function PosterCard({ project, index = 0 }: { project: PosterProject; index?: number }) {
  const reduceMotion = useReducedMotion();
  const thumb = safeUrl(project.thumbnailUrl);
  const hue = hueFromString(project.slug);

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.3), ease: [0.22, 1, 0.36, 1] }}
      className="group h-full"
    >
      <Link
        href={`/project/${project.slug}`}
        className="bg-card flex h-full flex-col overflow-hidden rounded-[var(--radius)] border border-[var(--hairline)] transition-[transform,box-shadow,border-color] duration-400 ease-out will-change-transform group-hover:-translate-y-1 group-hover:scale-[1.03] group-hover:border-[var(--hairline-strong)] group-hover:shadow-[0_18px_50px_-12px_var(--accent-glow)] motion-reduce:transform-none motion-reduce:transition-none"
      >
        <div className="relative aspect-[16/10] overflow-hidden">
          {thumb ? (
            /* eslint-disable-next-line @next/next/no-img-element -- URLs come from
               the admin panel and can point at any host, so we skip next/image
               remote-pattern config rather than have images silently 400. */
            <img
              src={thumb}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transform-none"
            />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center"
              style={{
                background: `linear-gradient(140deg, hsl(${hue} 42% 16%) 0%, hsl(${hue + 8} 30% 10%) 55%, #141416 100%)`,
              }}
            >
              <span
                className="font-display text-4xl tracking-tight"
                style={{ color: `hsl(${hue} 55% 62% / 0.55)` }}
              >
                {initials(project.title)}
              </span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0C]/70 via-transparent to-transparent" />
        </div>

        <div className="flex flex-1 flex-col gap-1.5 p-4">
          <h3 className="font-display group-hover:text-accent text-[15px] leading-snug transition-colors duration-300">
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
