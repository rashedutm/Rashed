"use client";

import { useEffect } from "react";

/**
 * Belt-and-suspenders URL tidiness: whenever a `#section` fragment ends up in
 * the address bar — from a deep link, a cross-page "/#work" landing, or any
 * click that slipped past `scrollToHash` — scroll to that section and strip the
 * fragment back out, so the URL always reads as a clean `/`.
 */
export function HashCleaner() {
  useEffect(() => {
    const clean = () => {
      const hash = window.location.hash;
      if (!hash || hash.length < 2) return;

      // Take just the first id, so an accumulated "#work#work" still resolves.
      const id = decodeURIComponent(hash.replace(/^#/, "").split("#")[0]);
      const el = id ? document.getElementById(id) : null;
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });

      // replaceState doesn't fire hashchange, so this can't loop.
      history.replaceState(null, "", window.location.pathname + window.location.search);
    };

    clean(); // handle a hash present on first load
    window.addEventListener("hashchange", clean);
    return () => window.removeEventListener("hashchange", clean);
  }, []);

  return null;
}
