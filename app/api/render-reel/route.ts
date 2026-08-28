import path from "node:path";
import os from "node:os";
import fs from "node:fs/promises";
import { existsSync } from "node:fs";
import { renderMedia, selectComposition } from "@remotion/renderer";
import chromium from "@sparticuz/chromium";
import {
  ANIMATIONS,
  ASPECT_RATIOS,
  DEFAULT_REEL_PROPS,
  FONT_KEYS,
  LINE_IDS,
  MAX_REEL_PHOTOS,
  REEL_CONTENT_TYPES,
  TRANSITIONS,
  type AnimKind,
  type FontKey,
  type LineId,
  type OverlayConfig,
  type PropertyReelProps,
  type ReelContentType,
  type TextLine,
  type TransitionKind,
} from "@/remotion/constants";

// The renderer downloads a headless browser on the first cold start, then
// composites the video — give it room.
export const maxDuration = 300;

// The reel has no WebGL — skip the graphics stack to save memory / space.
chromium.setGraphicsMode = false;

// Built by `scripts/bundle-remotion.mjs` (npm prebuild), traced into the
// function via next.config outputFileTracingIncludes.
const SERVE_DIR = path.join(process.cwd(), ".remotion-bundle");

const clamp = (n: unknown, lo: number, hi: number, dflt: number) =>
  typeof n === "number" && Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : dflt;
const str = (s: unknown, max: number, dflt: string) =>
  typeof s === "string" ? s.slice(0, max) : dflt;
const anim = (a: unknown, dflt: AnimKind): AnimKind =>
  ANIMATIONS.includes(a as AnimKind) ? (a as AnimKind) : dflt;
const font = (f: unknown, dflt: FontKey): FontKey =>
  FONT_KEYS.includes(f as FontKey) ? (f as FontKey) : dflt;

function sanitizeOverlay(raw: unknown, dflt: OverlayConfig): OverlayConfig {
  const o = (raw ?? {}) as Partial<OverlayConfig>;
  return {
    enabled: typeof o.enabled === "boolean" ? o.enabled : dflt.enabled,
    kind: o.kind === "solid" || o.kind === "gradient" ? o.kind : dflt.kind,
    color: str(o.color, 32, dflt.color),
    opacity: clamp(o.opacity, 0, 1, dflt.opacity),
    size: clamp(o.size, 0, 100, dflt.size),
  };
}

function sanitizeLines(raw: unknown): TextLine[] {
  const arr = Array.isArray(raw) ? raw : [];
  return LINE_IDS.map((id) => {
    const src = (arr.find((l) => (l as TextLine)?.id === id) ?? {}) as Partial<TextLine>;
    const d = DEFAULT_REEL_PROPS.lines.find((l) => l.id === id) as TextLine;
    return {
      id: id as LineId,
      text: str(src.text, 160, d.text),
      fontFamily: font(src.fontFamily, d.fontFamily),
      fontSize: clamp(src.fontSize, 10, 200, d.fontSize),
      color: str(src.color, 32, d.color),
      x: clamp(src.x, 0, 100, d.x),
      y: clamp(src.y, 0, 100, d.y),
      align:
        src.align === "left" || src.align === "center" || src.align === "right"
          ? src.align
          : d.align,
      enter: anim(src.enter, d.enter),
      exit: anim(src.exit, d.exit),
    };
  });
}

function sanitize(raw: unknown): PropertyReelProps {
  const p = (raw ?? {}) as Partial<PropertyReelProps>;
  const d = DEFAULT_REEL_PROPS;
  const logo = (p.logo ?? {}) as Partial<PropertyReelProps["logo"]>;
  const fb = (p.filmBurn ?? {}) as Partial<PropertyReelProps["filmBurn"]>;

  return {
    aspectRatio:
      p.aspectRatio && p.aspectRatio in ASPECT_RATIOS
        ? p.aspectRatio
        : d.aspectRatio,
    contentType: REEL_CONTENT_TYPES.includes(p.contentType as ReelContentType)
      ? (p.contentType as ReelContentType)
      : d.contentType,
    photos: Array.isArray(p.photos)
      ? p.photos
          .filter((u): u is string => typeof u === "string")
          .slice(0, MAX_REEL_PHOTOS)
      : [],
    transition: TRANSITIONS.includes(p.transition as TransitionKind)
      ? (p.transition as TransitionKind)
      : d.transition,
    filmBurn: {
      enabled: typeof fb.enabled === "boolean" ? fb.enabled : d.filmBurn.enabled,
      intensity: clamp(fb.intensity, 0, 1, d.filmBurn.intensity),
    },
    lines: sanitizeLines(p.lines),
    logo: {
      url:
        typeof logo.url === "string" && logo.url ? logo.url.slice(0, 500) : undefined,
      text: str(logo.text, 60, d.logo.text),
      font: font(logo.font, d.logo.font),
      size: clamp(logo.size, 12, 260, d.logo.size),
      position:
        logo.position === "top-left" ||
        logo.position === "top-right" ||
        logo.position === "bottom-left" ||
        logo.position === "bottom-right" ||
        logo.position === "custom"
          ? logo.position
          : d.logo.position,
      x: clamp(logo.x, 0, 100, d.logo.x),
      y: clamp(logo.y, 0, 100, d.logo.y),
      opacity: clamp(logo.opacity, 0, 1, d.logo.opacity),
      enter: anim(logo.enter, d.logo.enter),
      exit: anim(logo.exit, d.logo.exit),
    },
    topOverlay: sanitizeOverlay(p.topOverlay, d.topOverlay),
    bottomOverlay: sanitizeOverlay(p.bottomOverlay, d.bottomOverlay),
  };
}

export async function POST(req: Request) {
  const inputProps = sanitize(await req.json().catch(() => ({})));

  if (inputProps.photos.length === 0) {
    return Response.json(
      { error: "Agregá al menos una foto para generar el reel." },
      { status: 400 },
    );
  }
  if (!existsSync(SERVE_DIR)) {
    return Response.json(
      { error: "El motor de video no está disponible en este entorno." },
      { status: 503 },
    );
  }

  const outPath = path.join(os.tmpdir(), `cortex-reel-${Date.now()}.mp4`);
  const originalCwd = process.cwd();

  try {
    try {
      process.chdir(os.tmpdir());
    } catch {
      /* fine on local dev */
    }

    let browserExecutable: string | null = null;
    if (process.env.VERCEL) {
      browserExecutable = await chromium.executablePath();
    }

    const composition = await selectComposition({
      serveUrl: SERVE_DIR,
      id: "PropertyReel",
      inputProps,
      browserExecutable: browserExecutable ?? undefined,
      chromiumOptions: { gl: "angle" },
    });

    await renderMedia({
      composition,
      serveUrl: SERVE_DIR,
      codec: "h264",
      outputLocation: outPath,
      inputProps,
      imageFormat: "jpeg",
      browserExecutable: browserExecutable ?? undefined,
      chromiumOptions: { gl: "angle" },
      concurrency: 1,
    });

    const file = await fs.readFile(outPath);
    return new Response(new Uint8Array(file), {
      headers: {
        "Content-Type": "video/mp4",
        "Content-Disposition": `attachment; filename="cortex-reel.mp4"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[render-reel]", err);
    return Response.json(
      { error: "No se pudo renderizar el video." },
      { status: 500 },
    );
  } finally {
    try {
      process.chdir(originalCwd);
    } catch {
      /* ignore */
    }
    await fs.unlink(outPath).catch(() => undefined);
  }
}
