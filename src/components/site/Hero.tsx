"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { isDirectVideo, safeUrl, toYouTubeEmbedUrl } from "@/lib/utils";
import { FittedMedia } from "./FittedMedia";
import { HeroParticles } from "./HeroParticles";

type HeroProps = {
  name: string;
  headline: string;
  tagline: string;
  availability?: string | null;
  email?: string | null;
  resumeUrl?: string | null;
  heroVideoUrl?: string | null;
};

export function Hero({
  name,
  headline,
  tagline,
  availability,
  email,
  resumeUrl,
  heroVideoUrl,
}: HeroProps) {
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
    <section className="relative flex min-h-svh flex-col justify-center overflow-hidden pt-24 pb-24 sm:pt-28">
      {/* Bold aurora — vivid colour bleeding through the dark canvas, sitting
          behind and around the hero text so the whole block feels lit. */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div
          className="aurora-blob aurora-animate top-[4rem] -left-16 h-[32rem] w-[32rem] sm:left-0"
          style={{ background: "radial-gradient(circle, rgba(232,131,58,0.78), transparent 62%)" }}
        />
        <div
          className="aurora-blob aurora-animate top-[1rem] right-[2rem] h-[28rem] w-[28rem]"
          style={{
            background: "radial-gradient(circle, rgba(47,182,171,0.62), transparent 62%)",
            animationDelay: "-5s",
          }}
        />
        <div
          className="aurora-blob aurora-animate top-[13rem] left-[38%] h-[26rem] w-[26rem]"
          style={{
            background: "radial-gradient(circle, rgba(239,107,82,0.52), transparent 62%)",
            animationDelay: "-9s",
          }}
        />
      </div>

      {/* Interactive particle constellation spanning the whole hero. */}
      <HeroParticles />

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
          className="font-display text-gradient max-w-4xl text-[clamp(2rem,7vw,4.6rem)] leading-[1.05] text-balance"
        >
          {name}
        </motion.h1>

        <motion.p
          {...rise(0.13)}
          className="mt-5 max-w-2xl text-lg leading-snug sm:text-xl"
        >
          <span className="text-accent">{headline}</span>
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
          {email && (
            <a
              href={`mailto:${email}`}
              className="rounded-full border px-6 py-3 text-sm font-medium transition-all duration-300"
              style={{ borderColor: "var(--accent-2)", color: "var(--accent-2)" }}
            >
              Get in touch
            </a>
          )}
          {resume && (
            <a
              href={resume}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted hover:text-text rounded-full border border-[var(--hairline-strong)] px-6 py-3 text-sm font-medium transition-colors duration-300 hover:border-[var(--text)]/30"
            >
              Download Résumé
            </a>
          )}
        </motion.div>
      </div>

      {/* Scroll cue — signals there's work below the full-height hero. */}
      <motion.a
        href="#work"
        aria-label="Scroll to work"
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="text-muted hover:text-accent absolute inset-x-0 bottom-7 mx-auto flex w-fit flex-col items-center gap-1.5 text-[10px] tracking-[0.2em] uppercase transition-colors"
      >
        Scroll
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
          className="animate-bounce motion-reduce:animate-none"
        >
          <path
            d="M4 6l4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </motion.a>

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
                className="h-full w-full object-contain"
              />
            ) : (
              <FittedMedia src={video} eager />
            )}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0B0B0C] via-transparent to-transparent" />
          </div>
        </motion.div>
      )}
    </section>
  );
}
