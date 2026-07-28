"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/#work", label: "Work" },
  { href: "/#about", label: "About" },
  { href: "/#experience", label: "Experience" },
];

export function SiteNav({ name }: { name: string }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled
          ? "bg-base/70 border-b border-[var(--hairline)] backdrop-blur-xl"
          : "border-b border-transparent",
      )}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8 lg:px-12">
        <Link
          href="/"
          className="font-display text-text hover:text-accent text-lg tracking-tight transition-colors sm:text-xl"
        >
          {name}
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-muted hover:text-text relative text-sm transition-colors duration-300"
            >
              {link.label}
            </Link>
          ))}
          {/* Contact is promoted to a filled button — a larger, distinct target
              that's reachable from anywhere without scrolling (Fitts's Law). */}
          <Link
            href="/#contact"
            className="bg-accent hover:bg-accent-hover rounded-full px-4 py-2 text-sm font-medium text-[#1A0F06] transition-all duration-300 hover:shadow-[0_8px_24px_-8px_var(--accent-glow)]"
          >
            Contact
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label="Toggle menu"
          className="text-muted hover:text-text -mr-2 p-2 transition-colors md:hidden"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            {open ? (
              <path
                d="M5 5l10 10M15 5L5 15"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            ) : (
              <path
                d="M3 6h14M3 10h14M3 14h14"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            )}
          </svg>
        </button>
      </nav>

      {open && (
        <div className="bg-base/95 border-t border-[var(--hairline)] backdrop-blur-xl md:hidden">
          <div className="flex flex-col px-5 py-3 sm:px-8">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-muted hover:text-text border-b border-[var(--hairline)] py-3 text-sm transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/#contact"
              onClick={() => setOpen(false)}
              className="bg-accent hover:bg-accent-hover mt-4 rounded-full px-4 py-2.5 text-center text-sm font-medium text-[#1A0F06] transition-colors"
            >
              Contact
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
