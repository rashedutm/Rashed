"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { isDirectVideo, safeUrl, toYouTubeEmbedUrl } from "@/lib/utils";
import { scrollToHash } from "@/lib/scroll";
import { FittedMedia } from "./FittedMedia";
import { HeroParticles } from "./HeroParticles";
import { FloatingSkills } from "./FloatingSkills";

type HeroProps = {
  name: string;
  headline: string;
  tagline: string;
  availability?: string | null;
  availabilitySize?: string | null;
  email?: string | null;
  resumeUrl?: string | null;
  heroVideoUrl?: string | null;
  skills?: string[];
};

// Font/padding presets for the availability badge, chosen from the admin panel.
// All start compact on phones and only grow to the chosen size at `sm` and up,
// so the badge never gets oversized on mobile.
const BADGE_SIZE: Record<string, string> = {
  sm: "px-3 py-1 text-[11px]",
  md: "px-3 py-1 text-[11px] sm:px-4 sm:py-2 sm:text-sm",
  lg: "px-3 py-1 text-[11px] sm:px-5 sm:py-2.5 sm:text-base",
};

export function Hero({
  name,
  headline,
  tagline,
  availability,
  availabilitySize,
  email,
  resumeUrl,
  heroVideoUrl,
  skills = [],
}: HeroProps) {
  const reduceMotion = useReducedMotion();
  const resume = safeUrl(resumeUrl);
  const video = safeUrl(heroVideoUrl);
  const youtube = video ? toYouTubeEmbedUrl(video) : null;
  const badgeSize = BADGE_SIZE[availabilitySize ?? "md"] ?? BADGE_SIZE.md;

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

      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-8 px-5 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:px-12">
        {/* Left — the text, aligned left with generous breathing room. */}
        <div className="max-w-2xl">
          <motion.h1
            {...rise(0.06)}
            className="font-display text-gradient text-[clamp(2rem,6vw,4.4rem)] leading-[1.05] text-balance"
          >
            {name}
          </motion.h1>

          <motion.p {...rise(0.13)} className="mt-5 text-lg leading-snug sm:text-xl">
            <span className="text-accent">{headline}</span>
          </motion.p>

          <motion.p
            {...rise(0.19)}
            className="text-muted mt-4 max-w-xl text-[15px] leading-relaxed text-balance"
          >
            {tagline}
          </motion.p>

          {availability && (
            <motion.div {...rise(0.24)} className="mt-6">
              <span
                className={`badge-beat text-accent inline-flex origin-left items-center gap-2 rounded-full border font-medium ${badgeSize}`}
                style={{
                  borderColor: "color-mix(in srgb, var(--accent) 55%, transparent)",
                  backgroundColor: "rgba(232, 131, 58, 0.12)",
                }}
              >
                <span className="bg-accent relative flex h-2 w-2 rounded-full">
                  <span className="bg-accent absolute inline-flex h-full w-full animate-ping rounded-full opacity-70 motion-reduce:hidden" />
                </span>
                {availability}
              </span>
            </motion.div>
          )}

          <motion.div {...rise(0.3)} className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="#work"
              onClick={(e) => scrollToHash(e, "#work")}
              className="jelly bg-accent hover:bg-accent-hover rounded-full px-6 py-3 text-sm font-medium text-[#1A0F06] hover:shadow-[0_10px_32px_-8px_var(--accent-glow)]"
            >
              View Work
            </Link>
            {email && (
              <a
                href={`mailto:${email}`}
                className="jelly rounded-full border px-6 py-3 text-sm font-medium"
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
                className="jelly text-muted hover:text-text rounded-full border border-[var(--hairline-strong)] px-6 py-3 text-sm font-medium hover:border-[var(--text)]/30"
              >
                Download Résumé
              </a>
            )}
          </motion.div>
        </div>

        {/* Right — floating skill chips, the animated element. */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="relative hidden h-[34rem] lg:block"
        >
          <FloatingSkills skills={skills} />
        </motion.div>
      </div>

      {/* Scroll cue — signals there's work below the full-height hero. */}
      <motion.a
        href="#work"
        aria-label="Scroll to work"
        onClick={(e) => scrollToHash(e, "#work")}
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
