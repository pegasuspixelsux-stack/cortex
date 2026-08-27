// Browser-side image pre-processing. Every photo — manual upload, camera
// capture, or Drive import — passes through optimizeImage() before it goes
// to Firebase Storage, so the site and the Remotion reels stay fast.

export interface OptimizeOptions {
  /** Longest edge, in px, the image is allowed to keep. */
  maxDimension?: number;
  /** Hard ceiling for the output blob. The result is guaranteed below it. */
  maxBytes?: number;
  mimeType?: "image/jpeg" | "image/webp";
  /** Starting quality (0–1). Dropped automatically if the blob is too big. */
  quality?: number;
}

export interface OptimizedImage {
  file: File;
  width: number;
  height: number;
  originalBytes: number;
  bytes: number;
  /** True when the pipeline had to resize or recompress the original. */
  changed: boolean;
}

const DEFAULTS = {
  maxDimension: 2048,
  maxBytes: 5 * 1024 * 1024, // strictly under 5 MB
  mimeType: "image/jpeg" as const,
  quality: 0.85,
};

/**
 * Scales (w, h) down so neither edge exceeds `max`, preserving aspect ratio.
 * Never scales up. Pure — this is the part that's unit-tested.
 */
export function fitWithin(
  width: number,
  height: number,
  max: number,
): { width: number; height: number } {
  const longest = Math.max(width, height);
  if (longest <= max) return { width, height };
  const ratio = max / longest;
  return {
    width: Math.round(width * ratio),
    height: Math.round(height * ratio),
  };
}

function swapExtension(name: string, mimeType: string): string {
  const ext = mimeType === "image/webp" ? "webp" : "jpg";
  const base = name.replace(/\.[^.]+$/, "");
  return `${base || "imagen"}.${ext}`;
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("No se pudo leer la imagen."));
    };
    img.src = url;
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("toBlob falló."))),
      mimeType,
      quality,
    );
  });
}

/**
 * Resize + compress a single image entirely in the browser. Resizes so the
 * longest edge is <= maxDimension, then iteratively lowers quality and, if
 * needed, scale until the blob is strictly under maxBytes.
 */
export async function optimizeImage(
  file: File,
  options: OptimizeOptions = {},
): Promise<OptimizedImage> {
  const opts = { ...DEFAULTS, ...options };
  const originalBytes = file.size;

  const img = await loadImage(file);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D no disponible.");

  let { width, height } = fitWithin(
    img.naturalWidth,
    img.naturalHeight,
    opts.maxDimension,
  );
  let quality = opts.quality;
  let blob: Blob | null = null;

  for (let attempt = 0; attempt < 9; attempt++) {
    canvas.width = width;
    canvas.height = height;
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);
    blob = await canvasToBlob(canvas, opts.mimeType, quality);

    if (blob.size < opts.maxBytes) break;

    if (quality > 0.45) {
      quality = Math.max(0.4, quality - 0.12);
    } else {
      // Quality is as low as we'll go — shrink the canvas instead.
      width = Math.round(width * 0.82);
      height = Math.round(height * 0.82);
    }
  }

  if (!blob) throw new Error("No se pudo optimizar la imagen.");
  if (blob.size >= opts.maxBytes) {
    throw new Error("La imagen es demasiado grande incluso comprimida.");
  }

  const optimizedFile = new File([blob], swapExtension(file.name, opts.mimeType), {
    type: opts.mimeType,
    lastModified: Date.now(),
  });

  const changed =
    optimizedFile.size !== originalBytes ||
    width !== img.naturalWidth ||
    height !== img.naturalHeight;

  return {
    file: optimizedFile,
    width,
    height,
    originalBytes,
    bytes: optimizedFile.size,
    changed,
  };
}
