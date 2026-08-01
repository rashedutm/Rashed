import type { CSSProperties } from "react";
import { paletteAt } from "@/lib/categories";

// Hand-placed positions so the chips read as a loose, airy cluster rather than
// a grid. Each drifts on its own clock for organic, non-synced motion. Up to 15
// slots, scattered to keep them from overlapping.
const SLOTS = [
  { top: "3%", left: "30%", dur: "6.5s", delay: "0s" },
  { top: "9%", left: "63%", dur: "7.5s", delay: "-1.2s" },
  { top: "16%", left: "13%", dur: "8s", delay: "-2.4s" },
  { top: "22%", left: "44%", dur: "6.8s", delay: "-0.6s" },
  { top: "29%", left: "72%", dur: "7.2s", delay: "-3s" },
  { top: "35%", left: "25%", dur: "8.4s", delay: "-1.8s" },
  { top: "42%", left: "55%", dur: "7s", delay: "-2.1s" },
  { top: "48%", left: "12%", dur: "7.8s", delay: "-3.6s" },
  { top: "53%", left: "68%", dur: "6.6s", delay: "-0.9s" },
  { top: "60%", left: "37%", dur: "8.2s", delay: "-2.7s" },
  { top: "66%", left: "62%", dur: "7.4s", delay: "-1.5s" },
  { top: "71%", left: "18%", dur: "6.9s", delay: "-3.3s" },
  { top: "79%", left: "47%", dur: "8.1s", delay: "-0.3s" },
  { top: "85%", left: "70%", dur: "7.1s", delay: "-2.9s" },
  { top: "91%", left: "28%", dur: "7.7s", delay: "-1.1s" },
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
