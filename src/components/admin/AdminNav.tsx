"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/profile", label: "Profile / About" },
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/skills", label: "Skills" },
  { href: "/admin/experience", label: "Experience" },
  { href: "/admin/awards", label: "Awards" },
  { href: "/admin/education", label: "Education" },
  { href: "/admin/socials", label: "Contact & Socials" },
  { href: "/admin/account", label: "Account" },
];

export function AdminNav({
  username,
  signOutAction,
}: {
  username: string;
  signOutAction: () => Promise<void>;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <>
      {/* Mobile header */}
      <div className="flex items-center justify-between border-b border-[var(--hairline)] px-5 py-4 lg:hidden">
        <span className="font-display text-lg">Admin</span>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="text-muted hover:text-text text-sm transition-colors"
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      <aside
        className={cn(
          "bg-elevated/40 shrink-0 border-[var(--hairline)] lg:block lg:w-64 lg:border-r",
          open ? "block border-b" : "hidden",
        )}
      >
        <div className="flex h-full flex-col justify-between p-5 lg:sticky lg:top-0 lg:h-screen lg:p-6">
          <div>
            <div className="mb-8 hidden lg:block">
              <p className="font-display text-xl tracking-tight">Admin</p>
              <p className="text-muted mt-1 text-[12px]">Signed in as {username}</p>
            </div>

            <nav className="space-y-0.5">
              {LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "block rounded-[10px] px-3 py-2 text-[14px] transition-colors",
                    isActive(link.href, link.exact)
                      ? "bg-accent/10 text-accent"
                      : "text-muted hover:bg-elevated hover:text-text",
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="mt-8 space-y-2 border-t border-[var(--hairline)] pt-5">
            <Link
              href="/"
              target="_blank"
              className="text-muted hover:text-accent block px-3 text-[13px] transition-colors"
            >
              View site ↗
            </Link>
            <form action={signOutAction}>
              <button
                type="submit"
                className="text-muted block px-3 py-1 text-[13px] transition-colors hover:text-[#F0806B]"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </aside>
    </>
  );
}
