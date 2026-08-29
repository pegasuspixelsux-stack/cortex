const functions = require("firebase-functions");
const admin = require("firebase-admin");
const sharp = require("sharp");
const path = require("path");
const os = require("os");
const fs = require("fs");

admin.initializeApp();

// --- Watermark configuration ------------------------------------------------
const WATERMARK_TEXT = "CORTEX";
const WATERMARK_COLOR = "rgba(255, 255, 255, 0.6)"; // white, 60% opacity
const FONT_SIZE_RATIO = 0.05; // watermark height ≈ 5% of the image height

// Only these Storage prefixes get watermarked. `brand/` is excluded on
// purpose — that folder holds the site logo. Add prefixes here to widen.
const WATERMARK_PREFIXES = ["properties/"];

// Custom-metadata flag written on the output so re-processing the same file
// (the upload below re-triggers onFinalize) is a no-op instead of a loop.
const DONE_FLAG = "cortexWatermarked";

/**
 * Storage onFinalize trigger: stamps a centered semi-transparent "CORTEX"
 * text watermark onto uploaded property images, overwriting the original
 * in place so the existing download URL keeps working.
 */
exports.applyWatermark = functions
  .runWith({ memory: "512MB", timeoutSeconds: 120 })
  .storage.object()
  .onFinalize(async (object) => {
    const filePath = object.name;
    const contentType = object.contentType || "";

    if (!filePath || !contentType.startsWith("image/")) {
      console.log("Skipping — not an image:", filePath);
      return null;
    }

    // Already watermarked by a previous run of this function.
    if (object.metadata && object.metadata[DONE_FLAG] === "true") {
      console.log("Skipping — already watermarked:", filePath);
      return null;
    }

    // Scope: only the configured folders.
    if (!WATERMARK_PREFIXES.some((p) => filePath.startsWith(p))) {
      console.log("Skipping — outside watermark scope:", filePath);
      return null;
    }

    const bucket = admin.storage().bucket(object.bucket);
    const baseName = path.basename(filePath);
    const tempOriginal = path.join(os.tmpdir(), baseName);
    const tempOutput = path.join(os.tmpdir(), `wm_${baseName}`);

    try {
      await bucket.file(filePath).download({ destination: tempOriginal });

      const { width, height } = await sharp(tempOriginal).metadata();
      if (!width || !height) {
        console.warn("Skipping — could not read image size:", filePath);
        return null;
      }

      const fontSize = Math.max(20, Math.floor(height * FONT_SIZE_RATIO));
      const letterSpacing = Math.round(fontSize * 0.18);

      const svgOverlay = Buffer.from(`
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
          <style>
            .wm {
              font-family: Georgia, 'Times New Roman', serif;
              font-size: ${fontSize}px;
              letter-spacing: ${letterSpacing}px;
              fill: ${WATERMARK_COLOR};
            }
          </style>
          <text x="50%" y="50%" text-anchor="middle" dy=".35em" class="wm">${WATERMARK_TEXT}</text>
        </svg>
      `);

      await sharp(tempOriginal)
        .rotate() // respect EXIF orientation before compositing
        .composite([{ input: svgOverlay, top: 0, left: 0, blend: "over" }])
        .toFile(tempOutput);

      await bucket.upload(tempOutput, {
        destination: filePath,
        metadata: {
          contentType,
          cacheControl: "public, max-age=31536000",
          metadata: { [DONE_FLAG]: "true" },
        },
      });

      console.log(`Watermarked ${filePath}`);
    } catch (error) {
      console.error("Error applying watermark to", filePath, error);
    } finally {
      for (const f of [tempOriginal, tempOutput]) {
        if (fs.existsSync(f)) fs.unlinkSync(f);
      }
    }

    return null;
  });
