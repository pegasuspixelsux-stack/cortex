// Five luxury-real-estate style presets. Applying one keeps each line's
// text and swaps every visual property (font, size, colour, position,
// animation) plus the overlays and logo defaults. The user can then tweak
// any line by hand.

import type {
  AnimKind,
  FontKey,
  LineId,
  LogoConfig,
  OverlayConfig,
  TextLine,
} from "./constants";

type LineStyle = Omit<TextLine, "id" | "text">;

export interface Preset {
  key: string;
  label: string;
  lines: Record<LineId, LineStyle>;
  logo: Pick<LogoConfig, "size" | "position" | "opacity" | "enter" | "exit">;
  topOverlay: OverlayConfig;
  bottomOverlay: OverlayConfig;
}

const s = (
  fontFamily: FontKey,
  fontSize: number,
  color: string,
  x: number,
  y: number,
  align: LineStyle["align"],
  enter: AnimKind,
  exit: AnimKind,
): LineStyle => ({ fontFamily, fontSize, color, x, y, align, enter, exit });

const off: OverlayConfig = {
  enabled: false,
  kind: "gradient",
  color: "#060a1c",
  opacity: 0.3,
  size: 22,
};

export const PRESETS: Preset[] = [
  {
    key: "minimalist",
    label: "Modern Minimalist",
    lines: {
      zone: s("Inter", 24, "rgba(255,255,255,0.8)", 8, 64, "left", "fade-in", "fade-out"),
      title: s("Inter", 60, "#ffffff", 8, 70, "left", "fade-in", "fade"),
      price: s("Inter", 30, "rgba(255,255,255,0.85)", 8, 83, "left", "fade-in", "fade"),
      cta: s("Inter", 24, "#ffffff", 50, 60, "center", "fade-in", "fade-out"),
    },
    logo: { size: 32, position: "top-right", opacity: 0.85, enter: "fade", exit: "fade" },
    topOverlay: off,
    bottomOverlay: { enabled: true, kind: "gradient", color: "#060a1c", opacity: 0.55, size: 44 },
  },
  {
    key: "cinematic",
    label: "Cinematic Gold",
    lines: {
      zone: s("Cinzel", 24, "#d9b66b", 50, 56, "center", "slide-up", "fade"),
      title: s("Playfair Display", 76, "#f5efe4", 50, 63, "center", "slide-up", "fade"),
      price: s("Playfair Display", 36, "#d9b66b", 50, 78, "center", "fade-in", "fade"),
      cta: s("Cinzel", 22, "#d9b66b", 50, 68, "center", "fade-in", "fade-out"),
    },
    logo: { size: 44, position: "top-left", opacity: 0.95, enter: "fade", exit: "fade" },
    topOverlay: { enabled: true, kind: "gradient", color: "#0a0803", opacity: 0.35, size: 24 },
    bottomOverlay: { enabled: true, kind: "gradient", color: "#0a0803", opacity: 0.72, size: 55 },
  },
  {
    key: "bold",
    label: "Bold Luxury",
    lines: {
      zone: s("Montserrat", 22, "#33b8ff", 8, 56, "left", "slide-in", "slide-out"),
      title: s("Montserrat", 82, "#ffffff", 8, 62, "left", "slide-in", "slide-out"),
      price: s("Montserrat", 42, "#ffffff", 8, 81, "left", "slide-in", "slide-out"),
      cta: s("Montserrat", 26, "#ffffff", 50, 64, "center", "slide-up", "fade-out"),
    },
    logo: { size: 40, position: "bottom-right", opacity: 1, enter: "slide-in", exit: "fade" },
    topOverlay: off,
    bottomOverlay: { enabled: true, kind: "solid", color: "#06070f", opacity: 0.78, size: 40 },
  },
  {
    key: "corporate",
    label: "Clean Corporate",
    lines: {
      zone: s("Roboto", 24, "#4cc2ff", 8, 62, "left", "fade-in", "fade-out"),
      title: s("Roboto", 56, "#ffffff", 8, 68, "left", "fade-in", "fade"),
      price: s("Roboto", 30, "#ffffff", 8, 81, "left", "fade-in", "fade"),
      cta: s("Roboto", 24, "#4cc2ff", 50, 66, "center", "fade-in", "fade-out"),
    },
    logo: { size: 32, position: "top-left", opacity: 1, enter: "fade", exit: "fade" },
    topOverlay: { enabled: true, kind: "gradient", color: "#0b1020", opacity: 0.25, size: 20 },
    bottomOverlay: { enabled: true, kind: "gradient", color: "#0b1020", opacity: 0.5, size: 40 },
  },
  {
    key: "serif",
    label: "Elegant Serif",
    lines: {
      zone: s("Cinzel", 22, "rgba(255,255,255,0.85)", 50, 55, "center", "fade", "fade"),
      title: s("Playfair Display", 70, "#ffffff", 50, 62, "center", "fade-in", "fade"),
      price: s("Playfair Display", 32, "rgba(255,255,255,0.9)", 50, 76, "center", "fade-in", "fade"),
      cta: s("Cinzel", 20, "rgba(255,255,255,0.8)", 50, 71, "center", "fade-in", "fade-out"),
    },
    logo: { size: 38, position: "top-right", opacity: 0.85, enter: "fade", exit: "fade" },
    topOverlay: off,
    bottomOverlay: { enabled: true, kind: "gradient", color: "#0a0a12", opacity: 0.5, size: 50 },
  },
];

/** Re-style the given lines with a preset while keeping their text. */
export function applyPreset(preset: Preset, lines: TextLine[]): TextLine[] {
  return lines.map((l) => ({ id: l.id, text: l.text, ...preset.lines[l.id] }));
}
