import path from "node:path";
import os from "node:os";
import fs from "node:fs/promises";
import { existsSync } from "node:fs";
import { renderMedia, selectComposition } from "@remotion/renderer";
import chromium from "@sparticuz/chromium";
import {
  ASPECT_RATIOS,
  DEFAULT_REEL_PROPS,
  type PropertyReelProps,
} from "@/remotion/constants";

// The reel has no WebGL — skip the graphics stack to save memory / space.
chromium.setGraphicsMode = false;

// The renderer downloads a headless browser on the first cold start, then
// composites the video — give it room.
export const maxDuration = 300;

// Built by `scripts/bundle-remotion.mjs` (npm prebuild), traced into the
// function via next.config outputFileTracingIncludes.
const SERVE_DIR = path.join(process.cwd(), ".remotion-bundle");

function sanitize(raw: unknown): PropertyReelProps {
  const p = (raw ?? {}) as Partial<PropertyReelProps>;
  const aspectRatio =
    p.aspectRatio && p.aspectRatio in ASPECT_RATIOS
      ? p.aspectRatio
      : DEFAULT_REEL_PROPS.aspectRatio;
  return {
    aspectRatio,
    photos: Array.isArray(p.photos)
      ? p.photos.filter((u): u is string => typeof u === "string").slice(0, 10)
      : [],
    title: String(p.title ?? DEFAULT_REEL_PROPS.title).slice(0, 120),
    zone: String(p.zone ?? DEFAULT_REEL_PROPS.zone).slice(0, 120),
    price: String(p.price ?? DEFAULT_REEL_PROPS.price).slice(0, 60),
    agent: String(p.agent ?? DEFAULT_REEL_PROPS.agent).slice(0, 120),
    contact: String(p.contact ?? DEFAULT_REEL_PROPS.contact).slice(0, 160),
    logoUrl: typeof p.logoUrl === "string" && p.logoUrl ? p.logoUrl : undefined,
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

  // Vercel's working dir (/var/task) is read-only; Remotion writes its
  // downloaded browser relative to cwd, so point cwd at the one writable
  // place. SERVE_DIR is already absolute, so it survives the switch.
  const originalCwd = process.cwd();
  try {
    try {
      process.chdir(os.tmpdir());
    } catch {
      /* fine on local dev */
    }

    // On Vercel, use the Lambda-compatible Chromium (bundled shared libs).
    // Locally it throws — fall back to Remotion's own download.
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
