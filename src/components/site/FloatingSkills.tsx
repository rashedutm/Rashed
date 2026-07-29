import type { CSSProperties } from "react";
import { paletteAt } from "@/lib/categories";

// Hand-placed positions so the chips read as a loose, airy cluster rather than
// a grid. Each drifts on its own clock for organic, non-synced motion.
const SLOTS = [
  { top: "6%", left: "26%", dur: "6.5s", delay: "0s" },
  { top: "20%", left: "62%", dur: "7.5s", delay: "-1.2s" },
  { top: "34%", left: "8%", dur: "8s", delay: "-2.4s" },
  { top: "46%", left: "44%", dur: "6.8s", delay: "-0.6s" },
  { top: "60%", left: "68%", dur: "7.2s", delay: "-3s" },
  { top: "68%", left: "18%", dur: "8.4s", delay: "-1.8s" },
  { top: "82%", left: "48%", dur: "7s", delay: "-2.1s" },
  { top: "14%", left: "4%", dur: "7.8s", delay: "-3.6s" },
];

/**
 * A loose cluster of the site owner's key skills as glowing chips that gently
 * float — the animated element on the hero's right side. Pure CSS motion, so it
 * needs no client JS and pauses under reduced motion.
 */
export function FloatingSkills({ skills }: { skills: string[] }) {
  const chips = skills.slice(0, SLOTS.length);
  if (chips.length === 0) return null;

  return (
    <div className="relative h-full w-full" aria-hidden="true">
      {chips.map((skill, i) => {
        const slot = SLOTS[i];
        const color = paletteAt(i);
        return (
          <div
            key={skill}
            className="absolute -translate-x-1/2 motion-safe:animate-[float-bob_var(--dur)_ease-in-out_infinite]"
            style={
              {
                top: slot.top,
                left: slot.left,
                animationDelay: slot.delay,
                "--dur": slot.dur,
              } as CSSProperties
            }
          >
            <span
              className="bg-card/70 flex items-center gap-2 rounded-full border px-3.5 py-2 text-[13px] font-medium whitespace-nowrap backdrop-blur-md"
              style={{
                borderColor: `color-mix(in srgb, ${color.base} 45%, transparent)`,
                boxShadow: `0 8px 30px -12px ${color.glow}`,
                color: "var(--text)",
              }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: color.base, boxShadow: `0 0 8px ${color.base}` }}
              />
              {skill}
            </span>
          </div>
        );
      })}
    </div>
  );
}
