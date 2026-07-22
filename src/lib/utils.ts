/** Joins class names, dropping falsy values. */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

/** "Jun 2025" + "Oct 2025" → "Jun 2025 — Oct 2025"; handles current roles. */
export function formatDateRange(
  startDate: string,
  endDate?: string | null,
  current?: boolean,
): string {
  const end = current ? "Present" : endDate?.trim();
  if (!end || end === startDate) return startDate;
  return `${startDate} — ${end}`;
}

/**
 * Turns any YouTube URL (watch, youtu.be, shorts, or an existing embed link)
 * into an embeddable one. Returns null when it isn't YouTube, so the caller can
 * fall back to a plain <video> tag.
 */
export function toYouTubeEmbedUrl(url: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }

  const host = parsed.hostname.replace(/^www\./, "");
  let id: string | null = null;

  if (host === "youtu.be") {
    id = parsed.pathname.slice(1);
  } else if (host === "youtube.com" || host === "m.youtube.com" || host === "youtube-nocookie.com") {
    if (parsed.pathname === "/watch") id = parsed.searchParams.get("v");
    else if (parsed.pathname.startsWith("/embed/")) id = parsed.pathname.slice("/embed/".length);
    else if (parsed.pathname.startsWith("/shorts/")) id = parsed.pathname.slice("/shorts/".length);
  }

  if (!id || !/^[A-Za-z0-9_-]{6,20}$/.test(id)) return null;
  return `https://www.youtube-nocookie.com/embed/${id}`;
}

/** True for files a <video> tag can play directly. */
export function isDirectVideo(url: string): boolean {
  return /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url);
}

/**
 * Only http(s) links are ever rendered. Anything else (`javascript:`, `data:`)
 * becomes null so it can't be turned into an href. Admin input is validated on
 * the way in too — this is the second layer.
 */
export function safeUrl(url?: string | null): string | null {
  if (!url) return null;
  try {
    const { protocol } = new URL(url);
    return protocol === "http:" || protocol === "https:" ? url : null;
  } catch {
    return null;
  }
}

/** "MD Rashedur Rahman" → "MR" — used for image-less poster fallbacks. */
export function initials(text: string): string {
  return text
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}

/**
 * Deterministic hue per string, so a project without a thumbnail always gets
 * the same warm gradient rather than a new one on every render.
 */
export function hueFromString(text: string): number {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }
  // Keep it in the warm amber/sienna band the design system uses.
  return 12 + (Math.abs(hash) % 40);
}
