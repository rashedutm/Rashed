"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { isDirectVideo, safeUrl, toYouTubeEmbedUrl } from "@/lib/utils";

type HeroProps = {
  name: string;
  headline: string;
  tagline: string;
  availability?: string | null;
  resumeUrl?: string | null;
  heroVideoUrl?: string | null;
};

export function Hero({ name, headline, tagline, availability, resumeUrl, heroVideoUrl }: HeroProps) {
  const reduceMotion = useReducedMotion();
  const resume = safeUrl(resumeUrl);
  const video = safeUrl(heroVideoUrl);
  const youtube = video ? toYouTubeEmbedUrl(video) : null;

  const rise = (delay: number) => ({
    initial: reduceMotion ? false : { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] as const },
  });

  return (
    <section className="relative overflow-hidden pt-36 pb-16 sm:pt-44 sm:pb-20">
      <div className="hero-glow" aria-hidden="true" />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        {availability && (
          <motion.div {...rise(0)} className="mb-7">
            <span className="text-muted inline-flex items-center gap-2 rounded-full border border-[var(--hairline)] px-3.5 py-1.5 text-xs">
              <span className="bg-accent relative flex h-1.5 w-1.5 rounded-full">
                <span className="bg-accent absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 motion-reduce:hidden" />
              </span>
              {availability}
            </span>
          </motion.div>
        )}

        <motion.h1
          {...rise(0.06)}
          className="font-display max-w-4xl text-[clamp(2.4rem,7vw,4.6rem)] leading-[1.03] text-balance"
        >
          {name}
        </motion.h1>

        <motion.p
          {...rise(0.13)}
          className="text-accent mt-5 max-w-2xl text-lg leading-snug sm:text-xl"
        >
          {headline}
        </motion.p>

        <motion.p
          {...rise(0.19)}
          className="text-muted mt-4 max-w-xl text-[15px] leading-relaxed text-balance"
        >
          {tagline}
        </motion.p>

        <motion.div {...rise(0.26)} className="mt-9 flex flex-wrap items-center gap-3">
          <Link
            href="#work"
            className="bg-accent hover:bg-accent-hover rounded-full px-6 py-3 text-sm font-medium text-[#1A0F06] transition-all duration-300 hover:shadow-[0_10px_32px_-8px_var(--accent-glow)]"
          >
            View Work
          </Link>
          {resume && (
            <a
              href={resume}
              target="_blank"
              rel="noopener noreferrer"
              className="text-text rounded-full border border-[var(--hairline-strong)] px-6 py-3 text-sm font-medium transition-colors duration-300 hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              Download Résumé
            </a>
          )}
        </motion.div>
      </div>

      {video && (
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, scale: 0.985 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto mt-14 max-w-7xl px-5 sm:px-8 lg:px-12"
        >
          <div className="relative aspect-video overflow-hidden rounded-[var(--radius-lg)] border border-[var(--hairline)]">
            {youtube ? (
              <iframe
                src={`${youtube}?autoplay=1&mute=1&loop=1&controls=0&playsinline=1&modestbranding=1`}
                title="Featured video"
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
                className="h-full w-full"
              />
            ) : isDirectVideo(video) ? (
              <video
                src={video}
                autoPlay
                muted
                loop
                playsInline
                className="h-full w-full object-cover"
              />
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element -- admin-supplied remote URL */
              <img src={video} alt="" className="h-full w-full object-cover" />
            )}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0B0B0C] via-transparent to-transparent" />
          </div>
        </motion.div>
      )}
    </section>
  );
}
