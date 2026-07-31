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
 * An interactive particle constellation, hand-written in plain canvas.
 *
 * Performance notes (this runs on phones):
 *  - The animation loop is paused whenever the hero is scrolled out of view or
 *    the tab is hidden, so it never costs anything while reading the rest of
 *    the page.
 *  - Glowing dots are drawn from pre-rendered radial sprites instead of the
 *    per-dot canvas `shadowBlur`, which is very expensive on mobile GPUs.
 *  - Particle count and pixel ratio are scaled down on small screens.
 */
export function HeroParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !parent || !ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isSmall = window.matchMedia("(max-width: 768px)").matches;
    // Cheaper on phones: fewer device pixels to fill.
    const dpr = Math.min(window.devicePixelRatio || 1, isSmall ? 1.5 : 2);

    let width = 0;
    let height = 0;
    let particles: Particle[] = [];
    let raf = 0;
    let running = false;
    let visible = true; // hero on screen
    const pointer = { x: -9999, y: -9999, active: false };
    const LINK_DIST = isSmall ? 108 : 132;

    const rnd = (min: number, max: number) => Math.random() * (max - min) + min;

    // Pre-render one soft glowing dot per colour, so drawing is a cheap
    // drawImage instead of a live shadow blur.
    const SPRITE = 28;
    const sprites = new Map<string, HTMLCanvasElement>();
    const spriteFor = (color: string) => {
      const cached = sprites.get(color);
      if (cached) return cached;
      const s = document.createElement("canvas");
      s.width = s.height = SPRITE;
      const g = s.getContext("2d")!;
      const grad = g.createRadialGradient(SPRITE / 2, SPRITE / 2, 0, SPRITE / 2, SPRITE / 2, SPRITE / 2);
      grad.addColorStop(0, color);
      grad.addColorStop(0.35, color);
      grad.addColorStop(1, "transparent");
      g.fillStyle = grad;
      g.fillRect(0, 0, SPRITE, SPRITE);
      sprites.set(color, s);
      return s;
    };

    const spawn = (): Particle => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: rnd(-0.32, 0.32),
      vy: rnd(-0.32, 0.32),
      r: rnd(1, 2.6),
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

      // Fewer particles on phones; count scales with area, capped.
      const divisor = isSmall ? 24000 : 15000;
      const cap = isSmall ? 48 : 96;
      const count = Math.min(cap, Math.max(22, Math.round((width * height) / divisor)));
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

      // Glowing dots via cached sprites.
      for (const p of particles) {
        const size = p.r * 6;
        ctx.globalAlpha = p.alpha;
        ctx.drawImage(spriteFor(p.color), p.x - size / 2, p.y - size / 2, size, size);
      }
      ctx.globalAlpha = 1;
    };

    const step = () => {
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < -24) p.x = width + 24;
        else if (p.x > width + 24) p.x = -24;
        if (p.y < -24) p.y = height + 24;
        else if (p.y > height + 24) p.y = -24;

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

    const start = () => {
      if (running || reduceMotion || !visible || document.hidden) return;
      running = true;
      raf = requestAnimationFrame(step);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
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
    const onVisibility = () => (document.hidden ? stop() : start());

    resize();
    const resizeObserver = new ResizeObserver(() => {
      resize();
      if (reduceMotion) draw();
    });
    resizeObserver.observe(parent);

    // Only animate while the hero is actually on screen.
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) start();
        else stop();
      },
      { threshold: 0 },
    );
    io.observe(parent);

    if (reduceMotion) {
      draw(); // one static frame, no loop
    } else {
      parent.addEventListener("pointermove", onPointerMove);
      parent.addEventListener("pointerleave", onPointerLeave);
      document.addEventListener("visibilitychange", onVisibility);
      start();
    }

    return () => {
      stop();
      resizeObserver.disconnect();
      io.disconnect();
      parent.removeEventListener("pointermove", onPointerMove);
      parent.removeEventListener("pointerleave", onPointerLeave);
      document.removeEventListener("visibilitychange", onVisibility);
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
