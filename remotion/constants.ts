// Shared config + data model for the Cortex property reel. No Next.js /
// Tailwind / font-loading imports so @remotion/bundler can build it
// standalone and the API route can import the types cheaply.

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

export const FONT_KEYS = [
  "Inter",
  "Playfair Display",
  "Montserrat",
  "Roboto",
  "Cinzel",
] as const;
export type FontKey = (typeof FONT_KEYS)[number];

export const ANIMATIONS = [
  "none",
  "fade",
  "fade-in",
  "fade-out",
  "slide-in",
  "slide-out",
  "slide-up",
  "slide-down",
] as const;
export type AnimKind = (typeof ANIMATIONS)[number];

export const TRANSITIONS = [
  "cut",
  "crossfade",
  "slide-h",
  "slide-v",
  "zoom",
  "wipe",
] as const;
export type TransitionKind = (typeof TRANSITIONS)[number];
export const TRANSITION_LABEL: Record<TransitionKind, string> = {
  cut: "Corte directo",
  crossfade: "Crossfade",
  "slide-h": "Slide horizontal",
  "slide-v": "Slide vertical",
  zoom: "Zoom",
  wipe: "Wipe / barrido",
};
/** Frames a non-cut transition overlaps two scenes. */
export const TRANSITION_DURATION = 20;

export interface FilmBurnConfig {
  enabled: boolean;
  /** 0–1. */
  intensity: number;
}

export type ReelContentType = "Venta" | "Alquiler";
export const REEL_CONTENT_TYPES: ReelContentType[] = ["Venta", "Alquiler"];

export type LineId = "zone" | "title" | "price" | "custom" | "cta";
export const LINE_IDS: LineId[] = ["zone", "title", "price", "custom", "cta"];
export const LINE_LABEL: Record<LineId, string> = {
  zone: "Zona",
  title: "Título",
  price: "Precio",
  custom: "Línea personalizada",
  cta: "CTA / Contacto",
};

export interface TextLine {
  id: LineId;
  text: string;
  fontFamily: FontKey;
  /** Composition-space px. */
  fontSize: number;
  color: string;
  /** 0–100, % of composition width (anchor follows `align`). */
  x: number;
  /** 0–100, % of composition height (top anchor). */
  y: number;
  align: "left" | "center" | "right";
  enter: AnimKind;
  exit: AnimKind;
}

export type LogoCorner =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | "custom";

export interface LogoConfig {
  url?: string;
  /** Composition-space px (height; width auto). */
  size: number;
  position: LogoCorner;
  /** Used when position === "custom". */
  x: number;
  y: number;
  opacity: number;
  enter: AnimKind;
  exit: AnimKind;
}

export interface OverlayConfig {
  enabled: boolean;
  kind: "solid" | "gradient";
  color: string;
  opacity: number;
  /** 0–100, % of composition height the band covers. */
  size: number;
}

export interface PropertyReelProps extends Record<string, unknown> {
  aspectRatio: AspectRatioKey;
  contentType: ReelContentType;
  photos: string[];
  transition: TransitionKind;
  filmBurn: FilmBurnConfig;
  lines: TextLine[];
  logo: LogoConfig;
  topOverlay: OverlayConfig;
  bottomOverlay: OverlayConfig;
}

const line = (over: Partial<TextLine> & Pick<TextLine, "id" | "text">): TextLine => ({
  fontFamily: "Inter",
  fontSize: 40,
  color: "#ffffff",
  x: 8,
  y: 68,
  align: "left",
  enter: "fade-in",
  exit: "fade-out",
  ...over,
});

export const DEFAULT_LINES: TextLine[] = [
  line({ id: "zone", text: "José Ignacio, Punta del Este", fontSize: 26, y: 60 }),
  line({ id: "title", text: "Residencia Océano", fontSize: 62, y: 66 }),
  line({ id: "price", text: "USD 3.200.000", fontSize: 32, y: 80 }),
  line({ id: "custom", text: "", fontSize: 24, y: 88, color: "rgba(255,255,255,0.9)" }),
  line({ id: "cta", text: "Cortex Real Estate · +598 99 000 000", fontSize: 24, x: 50, y: 66, align: "center" }),
];

export const DEFAULT_LOGO: LogoConfig = {
  url: undefined,
  size: 36,
  position: "top-right",
  x: 88,
  y: 8,
  opacity: 0.9,
  enter: "fade",
  exit: "fade",
};

export const DEFAULT_TOP_OVERLAY: OverlayConfig = {
  enabled: false,
  kind: "gradient",
  color: "#060a1c",
  opacity: 0.3,
  size: 22,
};

export const DEFAULT_BOTTOM_OVERLAY: OverlayConfig = {
  enabled: true,
  kind: "gradient",
  color: "#060a1c",
  opacity: 0.55,
  size: 45,
};

export const DEFAULT_REEL_PROPS: PropertyReelProps = {
  aspectRatio: "vertical",
  contentType: "Venta",
  photos: [],
  transition: "crossfade",
  filmBurn: { enabled: false, intensity: 0.5 },
  lines: DEFAULT_LINES,
  logo: DEFAULT_LOGO,
  topOverlay: DEFAULT_TOP_OVERLAY,
  bottomOverlay: DEFAULT_BOTTOM_OVERLAY,
};

/** Total composition length, accounting for transition overlap. */
export function reelDuration(photoCount: number, transition: TransitionKind): number {
  const td = transition === "cut" ? 1 : TRANSITION_DURATION;
  const n = Math.max(0, photoCount);
  return n * SCENE_DURATION + CTA_DURATION - n * td;
}

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
