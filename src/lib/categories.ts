/**
 * Categorical colour system.
 *
 * Each project category gets a stable identity colour so visitors can tell
 * categories apart at a glance (colour coding — a recognition-over-recall aid
 * from HCI). The hues are deliberately spread around the wheel and kept clear
 * of purple/pink: warm amber leads, teal is its complementary anchor, and the
 * rest fill in as distinct, legible-on-dark accents.
 */
export type CategoryColor = {
  base: string;
  /** Big soft shadow colour for hover glows. */
  glow: string;
  /** Low-opacity fill for active chips / tinted surfaces. */
  soft: string;
};

export const CATEGORY_PALETTE: CategoryColor[] = [
  { base: "#e8833a", glow: "rgba(232,131,58,0.38)", soft: "rgba(232,131,58,0.15)" }, // amber
  { base: "#2fb6ab", glow: "rgba(47,182,171,0.38)", soft: "rgba(47,182,171,0.15)" }, // teal
  { base: "#e6b24a", glow: "rgba(230,178,74,0.34)", soft: "rgba(230,178,74,0.15)" }, // gold
  { base: "#ef6b52", glow: "rgba(239,107,82,0.38)", soft: "rgba(239,107,82,0.15)" }, // coral
  { base: "#4aa8d8", glow: "rgba(74,168,216,0.36)", soft: "rgba(74,168,216,0.15)" }, // sky
  { base: "#8fb84a", glow: "rgba(143,184,74,0.34)", soft: "rgba(143,184,74,0.15)" }, // sage
];

/** Amber, matching the primary accent — used for "Featured" and "All". */
export const PRIMARY_COLOR = CATEGORY_PALETTE[0];

/** Cycles the palette by position, so the Nth category always gets the Nth hue. */
export function paletteAt(index: number): CategoryColor {
  return CATEGORY_PALETTE[((index % CATEGORY_PALETTE.length) + CATEGORY_PALETTE.length) % CATEGORY_PALETTE.length];
}
