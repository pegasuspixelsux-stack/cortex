// Five luxury-real-estate style presets. Applying one keeps each line's
// text and swaps every visual property (font, size, colour, position,
// animation) plus the overlays and logo defaults. The user can then tweak
// any line by hand.

import type {
  AnimKind,
  FilmBurnConfig,
  FontKey,
  LineId,
  LogoConfig,
  OverlayConfig,
  TextLine,
  TransitionKind,
} from "./constants";

type LineStyle = Omit<TextLine, "id" | "text">;
type LogoStyle = Omit<LogoConfig, "url">;

export interface Preset {
  key: string;
  label: string;
  lines: Record<LineId, LineStyle>;
  logo: LogoStyle;
  topOverlay: OverlayConfig;
  bottomOverlay: OverlayConfig;
  transition: TransitionKind;
  filmBurn: FilmBurnConfig;
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

const lg = (
  size: number,
  position: LogoStyle["position"],
  opacity: number,
  enter: AnimKind,
  exit: AnimKind,
  font: FontKey = "Playfair Display",
): LogoStyle => ({
  size,
  position,
  opacity,
  enter,
  exit,
  x: 88,
  y: 8,
  text: "",
  font,
});

const noBurn: FilmBurnConfig = { enabled: false, intensity: 0.5 };

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
      custom: s("Inter", 22, "rgba(255,255,255,0.75)", 8, 90, "left", "fade-in", "fade-out"),
      cta: s("Inter", 24, "#ffffff", 50, 60, "center", "fade-in", "fade-out"),
    },
    logo: lg(32, "top-right", 0.85, "fade", "fade"),
    topOverlay: off,
    bottomOverlay: { enabled: true, kind: "gradient", color: "#060a1c", opacity: 0.55, size: 44 },
    transition: "crossfade",
    filmBurn: noBurn,
  },
  {
    key: "cinematic",
    label: "Cinematic Gold",
    lines: {
      zone: s("Cinzel", 24, "#d9b66b", 50, 56, "center", "slide-up", "fade"),
      title: s("Playfair Display", 76, "#f5efe4", 50, 63, "center", "slide-up", "fade"),
      price: s("Playfair Display", 36, "#d9b66b", 50, 78, "center", "fade-in", "fade"),
      custom: s("Cinzel", 20, "#d9b66b", 50, 87, "center", "fade-in", "fade-out"),
      cta: s("Cinzel", 22, "#d9b66b", 50, 68, "center", "fade-in", "fade-out"),
    },
    logo: lg(44, "top-left", 0.95, "fade", "fade"),
    topOverlay: { enabled: true, kind: "gradient", color: "#0a0803", opacity: 0.35, size: 24 },
    bottomOverlay: { enabled: true, kind: "gradient", color: "#0a0803", opacity: 0.72, size: 55 },
    transition: "zoom",
    filmBurn: { enabled: true, intensity: 0.55 },
  },
  {
    key: "bold",
    label: "Bold Luxury",
    lines: {
      zone: s("Montserrat", 22, "#33b8ff", 8, 56, "left", "slide-in", "slide-out"),
      title: s("Montserrat", 82, "#ffffff", 8, 62, "left", "slide-in", "slide-out"),
      price: s("Montserrat", 42, "#ffffff", 8, 81, "left", "slide-in", "slide-out"),
      custom: s("Montserrat", 24, "#33b8ff", 8, 91, "left", "slide-in", "slide-out"),
      cta: s("Montserrat", 26, "#ffffff", 50, 64, "center", "slide-up", "fade-out"),
    },
    logo: lg(40, "bottom-right", 1, "slide-in", "fade"),
    topOverlay: off,
    bottomOverlay: { enabled: true, kind: "solid", color: "#06070f", opacity: 0.78, size: 40 },
    transition: "slide-h",
    filmBurn: noBurn,
  },
  {
    key: "corporate",
    label: "Clean Corporate",
    lines: {
      zone: s("Roboto", 24, "#4cc2ff", 8, 62, "left", "fade-in", "fade-out"),
      title: s("Roboto", 56, "#ffffff", 8, 68, "left", "fade-in", "fade"),
      price: s("Roboto", 30, "#ffffff", 8, 81, "left", "fade-in", "fade"),
      custom: s("Roboto", 22, "#4cc2ff", 8, 90, "left", "fade-in", "fade-out"),
      cta: s("Roboto", 24, "#4cc2ff", 50, 66, "center", "fade-in", "fade-out"),
    },
    logo: lg(32, "top-left", 1, "fade", "fade"),
    topOverlay: { enabled: true, kind: "gradient", color: "#0b1020", opacity: 0.25, size: 20 },
    bottomOverlay: { enabled: true, kind: "gradient", color: "#0b1020", opacity: 0.5, size: 40 },
    transition: "crossfade",
    filmBurn: noBurn,
  },
  {
    key: "serif",
    label: "Elegant Serif",
    lines: {
      zone: s("Cinzel", 22, "rgba(255,255,255,0.85)", 50, 55, "center", "fade", "fade"),
      title: s("Playfair Display", 70, "#ffffff", 50, 62, "center", "fade-in", "fade"),
      price: s("Playfair Display", 32, "rgba(255,255,255,0.9)", 50, 76, "center", "fade-in", "fade"),
      custom: s("Cinzel", 18, "rgba(255,255,255,0.8)", 50, 86, "center", "fade-in", "fade-out"),
      cta: s("Cinzel", 20, "rgba(255,255,255,0.8)", 50, 71, "center", "fade-in", "fade-out"),
    },
    logo: lg(38, "top-right", 0.85, "fade", "fade"),
    topOverlay: off,
    bottomOverlay: { enabled: true, kind: "gradient", color: "#0a0a12", opacity: 0.5, size: 50 },
    transition: "crossfade",
    filmBurn: noBurn,
  },
];

/** Re-style the given lines with a preset while keeping their text. */
export function applyPreset(preset: Preset, lines: TextLine[]): TextLine[] {
  return lines.map((l) => ({ id: l.id, text: l.text, ...preset.lines[l.id] }));
}
