"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { Project, ProjectFeature, ProjectMedia, ProjectTech } from "@prisma/client";
import { hueFromString, initials, isDirectVideo, safeUrl, toYouTubeEmbedUrl } from "@/lib/utils";

type FullProject = Project & {
  tech: ProjectTech[];
  features: ProjectFeature[];
  media: ProjectMedia[];
};

export function ProjectDetail({ project }: { project: FullProject }) {
  const reduceMotion = useReducedMotion();

  const video = safeUrl(project.videoUrl);
  const youtube = video ? toYouTubeEmbedUrl(video) : null;
  const thumb = safeUrl(project.thumbnailUrl);
  const live = safeUrl(project.liveUrl);
  const repo = safeUrl(project.repoUrl);
  const hue = hueFromString(project.slug);
  const gallery = project.media.filter((m) => safeUrl(m.url));

  return (
    <motion.article
      initial={reduceMotion ? false : { opacity: 0, scale: 0.99 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto max-w-5xl px-5 sm:px-8"
    >
      {/* Hero media — video wins over the still image when both exist. */}
      <div className="bg-elevated relative aspect-video overflow-hidden rounded-[var(--radius-lg)] border border-[var(--hairline)]">
        {youtube ? (
          <iframe
            src={youtube}
            title={project.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
            allowFullScreen
            className="h-full w-full"
          />
        ) : video && isDirectVideo(video) ? (
          <video src={video} controls playsInline className="h-full w-full object-cover" />
        ) : thumb ? (
          /* eslint-disable-next-line @next/next/no-img-element -- admin-supplied remote URL */
          <img src={thumb} alt={project.title} className="h-full w-full object-cover" />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center"
            style={{
              background: `linear-gradient(140deg, hsl(${hue} 42% 16%) 0%, hsl(${hue + 8} 30% 10%) 55%, #141416 100%)`,
            }}
          >
            <span
              className="font-display text-6xl tracking-tight"
              style={{ color: `hsl(${hue} 55% 62% / 0.5)` }}
            >
              {initials(project.title)}
            </span>
          </div>
        )}
      </div>

      <header className="mt-10">
        <p className="text-accent mb-3 text-[11px] tracking-[0.18em] uppercase">
          {project.category}
        </p>
        <h1 className="font-display text-[clamp(1.9rem,5vw,3.2rem)] leading-[1.08] tracking-tight text-balance">
          {project.title}
        </h1>
        {project.subtitle && (
          <p className="text-muted mt-4 max-w-2xl text-lg leading-relaxed">{project.subtitle}</p>
        )}

        {(live || repo) && (
          <div className="mt-7 flex flex-wrap gap-3">
            {live && (
              <a
                href={live}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-accent hover:bg-accent-hover rounded-full px-5 py-2.5 text-sm font-medium text-[#1A0F06] transition-all duration-300 hover:shadow-[0_10px_32px_-8px_var(--accent-glow)]"
              >
                Live Demo
              </a>
            )}
            {repo && (
              <a
                href={repo}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-[var(--hairline-strong)] px-5 py-2.5 text-sm font-medium transition-colors duration-300 hover:border-[var(--accent)] hover:text-[var(--accent)]"
              >
                GitHub
              </a>
            )}
          </div>
        )}
      </header>

      <div className="mt-12 grid gap-12 md:grid-cols-[minmax(0,1fr)_minmax(0,240px)] md:gap-16">
        <div className="order-2 space-y-12 md:order-1">
          <div>
            <SectionLabel>Overview</SectionLabel>
            <div className="space-y-4">
              {project.description.split(/\n{2,}/).map((paragraph, i) => (
                <p key={i} className="leading-relaxed whitespace-pre-line">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          {project.features.length > 0 && (
            <div>
              <SectionLabel>Key features</SectionLabel>
              <ul className="space-y-3">
                {project.features.map((feature) => (
                  <li key={feature.id} className="flex gap-3 leading-relaxed">
                    <span className="bg-accent/60 mt-2.5 h-1 w-1 shrink-0 rounded-full" />
                    <span className="text-muted">{feature.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {gallery.length > 0 && (
            <div>
              <SectionLabel>Gallery</SectionLabel>
              <div className="grid gap-4 sm:grid-cols-2">
                {gallery.map((item) => (
                  <figure key={item.id}>
                    <div className="bg-elevated overflow-hidden rounded-[var(--radius)] border border-[var(--hairline)]">
                      {/* eslint-disable-next-line @next/next/no-img-element -- admin-supplied remote URL */}
                      <img
                        src={item.url}
                        alt={item.caption ?? ""}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 hover:scale-[1.02] motion-reduce:transform-none"
                      />
                    </div>
                    {item.caption && (
                      <figcaption className="text-muted mt-2 text-[13px]">{item.caption}</figcaption>
                    )}
                  </figure>
                ))}
              </div>
            </div>
          )}
        </div>

        <aside className="order-1 space-y-8 md:order-2">
          {project.role && (
            <div>
              <SectionLabel>My role</SectionLabel>
              <p className="text-muted text-[14px] leading-relaxed">{project.role}</p>
            </div>
          )}

          {project.tech.length > 0 && (
            <div>
              <SectionLabel>Tech stack</SectionLabel>
              <div className="flex flex-wrap gap-2">
                {project.tech.map((t) => (
                  <span
                    key={t.id}
                    className="bg-card rounded-full border border-[var(--hairline)] px-3 py-1.5 text-[12px]"
                  >
                    {t.techName}
                  </span>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </motion.article>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-muted mb-4 text-[11px] tracking-[0.16em] uppercase">{children}</h2>
  );
}
