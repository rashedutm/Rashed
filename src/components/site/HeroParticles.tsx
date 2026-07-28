"use client";

import { useEffect, useRef } from "react";

// Brand palette — warm amber leads, teal/coral/gold/sky for variety. These are
// the same hues used across the site, never ReactBits' own colours.
const COLORS = ["#e8833a", "#2fb6ab", "#e6b24a", "#ef6b52", "#4aa8d8"];

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  color: string;
  alpha: number;
};

/**
 * An interactive particle constellation, in the spirit of ReactBits' animated
 * backgrounds but hand-written in plain canvas (no dependency). Glowing dots
 * drift across the hero, link to their neighbours with faint lines, and gently
 * push away from the cursor. Falls back to a single static frame when the
 * visitor prefers reduced motion.
 */
export function HeroParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !parent || !ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let width = 0;
    let height = 0;
    let particles: Particle[] = [];
    let raf = 0;
    const pointer = { x: -9999, y: -9999, active: false };
    const LINK_DIST = 132;

    const rnd = (min: number, max: number) => Math.random() * (max - min) + min;

    const spawn = (): Particle => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: rnd(-0.35, 0.35),
      vy: rnd(-0.35, 0.35),
      r: rnd(1, 3),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      alpha: rnd(0.35, 0.9),
    });

    const resize = () => {
      const rect = parent.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Particle count scales with area, capped for performance.
      const count = Math.min(96, Math.max(28, Math.round((width * height) / 15000)));
      particles = Array.from({ length: count }, spawn);
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Connecting lines first, so dots sit on top.
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist < LINK_DIST) {
            ctx.strokeStyle = a.color;
            ctx.globalAlpha = (1 - dist / LINK_DIST) * 0.16;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // Glowing dots.
      ctx.globalAlpha = 1;
      for (const p of particles) {
        ctx.beginPath();
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 12;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
    };

    const step = () => {
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around the edges for a seamless field.
        if (p.x < -24) p.x = width + 24;
        else if (p.x > width + 24) p.x = -24;
        if (p.y < -24) p.y = height + 24;
        else if (p.y > height + 24) p.y = -24;

        // Gentle push away from the cursor.
        if (pointer.active) {
          const dx = p.x - pointer.x;
          const dy = p.y - pointer.y;
          const d2 = dx * dx + dy * dy;
          const R = 130;
          if (d2 < R * R && d2 > 0.01) {
            const d = Math.sqrt(d2);
            const force = ((R - d) / R) * 0.8;
            p.x += (dx / d) * force;
            p.y += (dy / d) * force;
          }
        }
      }
      draw();
      raf = requestAnimationFrame(step);
    };

    const onPointerMove = (e: PointerEvent) => {
      const rect = parent.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
      pointer.active = true;
    };
    const onPointerLeave = () => {
      pointer.active = false;
      pointer.x = -9999;
      pointer.y = -9999;
    };

    resize();
    // Under reduced motion there is no animation loop, so redraw the static
    // field whenever the layout changes, otherwise it would blank out.
    const resizeObserver = new ResizeObserver(() => {
      resize();
      if (reduceMotion) draw();
    });
    resizeObserver.observe(parent);

    if (reduceMotion) {
      draw(); // one static frame, no animation loop
    } else {
      parent.addEventListener("pointermove", onPointerMove);
      parent.addEventListener("pointerleave", onPointerLeave);
      raf = requestAnimationFrame(step);
    }

    return () => {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      parent.removeEventListener("pointermove", onPointerMove);
      parent.removeEventListener("pointerleave", onPointerLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden="true"
    />
  );
}
