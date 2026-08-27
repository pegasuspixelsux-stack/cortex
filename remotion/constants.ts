// Shared config for the Cortex property reel. Kept free of Next.js / Tailwind
// imports so @remotion/bundler can build it standalone for MP4 rendering.

export const FPS = 30;
/** Frames each photo stays on screen (3s). */
export const SCENE_DURATION = 90;
/** Frames of the closing contact card (4s). */
export const CTA_DURATION = 120;

export const ASPECT_RATIOS = {
  vertical: { label: "Vertical · 9:16", platform: "Reels · TikTok · Shorts", width: 1080, height: 1920 },
  square: { label: "Cuadrado · 1:1", platform: "Feed de Instagram", width: 1080, height: 1080 },
  horizontal: { label: "Horizontal · 16:9", platform: "Feed de Facebook", width: 1920, height: 1080 },
} as const;

export type AspectRatioKey = keyof typeof ASPECT_RATIOS;

// Extends Record<string, unknown> so it satisfies Remotion's Composition
// props constraint while keeping the known fields fully typed.
export interface PropertyReelProps extends Record<string, unknown> {
  aspectRatio: AspectRatioKey;
  photos: string[];
  title: string;
  zone: string;
  /** Pre-formatted, e.g. "USD 3.200.000". */
  price: string;
  agent: string;
  contact: string;
  /** Optional logo image URL; falls back to the built-in Cortex mark. */
  logoUrl?: string;
}

export const DEFAULT_REEL_PROPS: PropertyReelProps = {
  aspectRatio: "vertical",
  photos: [],
  title: "Residencia Océano",
  zone: "José Ignacio, Punta del Este",
  price: "USD 3.200.000",
  agent: "Cortex Real Estate",
  contact: "+598 99 000 000 · cortexrealestate.com",
  logoUrl: undefined,
};

export const BRAND = {
  ink: "#080a1c",
  cream: "#f4f6fb",
  creamSoft: "#9aa3b4",
  accent: "#0609c6",
  accentBright: "#0085cc",
};

/** Total composition length for a given number of photos (CTA always plays). */
export function reelDurationInFrames(photoCount: number): number {
  return Math.max(0, photoCount) * SCENE_DURATION + CTA_DURATION;
}
