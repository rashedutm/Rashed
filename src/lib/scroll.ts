import type { MouseEvent } from "react";

/**
 * Smoothly scrolls to an in-page section without leaving a `#hash` in the URL.
 *
 * If the target element isn't on the current page (e.g. following `/#work`
 * from a project page), it does nothing and lets the browser navigate normally.
 */
export function scrollToHash(e: MouseEvent<HTMLElement>, href: string) {
  const id = href.replace(/^.*#/, "");
  if (!id) return;

  const el = document.getElementById(id);
  if (!el) return; // target lives on another page — allow normal navigation

  e.preventDefault();
  el.scrollIntoView({ behavior: "smooth", block: "start" });
  // Keep the address bar clean — never show #work / #contact etc.
  history.replaceState(null, "", window.location.pathname + window.location.search);
}
