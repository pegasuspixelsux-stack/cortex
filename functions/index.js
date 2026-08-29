const { onObjectFinalized } = require("firebase-functions/v2/storage");
const { setGlobalOptions } = require("firebase-functions/v2");
const logger = require("firebase-functions/logger");
const { initializeApp } = require("firebase-admin/app");
const { getStorage } = require("firebase-admin/storage");
const sharp = require("sharp");

initializeApp();
setGlobalOptions({ region: "us-central1", maxInstances: 10 });

// --- Watermark configuration ----------------------------------------------
const WATERMARK_TEXT = "CORTEX";
const WATERMARK_COLOR = "rgba(255, 255, 255, 0.6)"; // white, 60% opacity
const FONT_SIZE_RATIO = 0.05; // watermark height ≈ 5% of the image height

// Only these Storage prefixes get watermarked. `brand/` is excluded on
// purpose — that folder holds the site logo. Add prefixes to widen.
const WATERMARK_PREFIXES = ["properties/"];

// Custom-metadata flag written on the output so the re-upload below (which
// re-triggers this function) is a no-op instead of an infinite loop.
const DONE_FLAG = "cortexWatermarked";

/**
 * Storage onObjectFinalized (2nd gen): stamps a centered semi-transparent
 * "CORTEX" wordmark onto uploaded property images, overwriting the
 * original in place so the existing download URL keeps working.
 */
exports.applyWatermark = onObjectFinalized(
  { memory: "1GiB", timeoutSeconds: 120 },
  async (event) => {
    const object = event.data;
    const filePath = object.name;
    const contentType = object.contentType || "";

    if (!filePath || !contentType.startsWith("image/")) {
      logger.debug("Skip — not an image", { filePath });
      return;
    }
    if (object.metadata && object.metadata[DONE_FLAG] === "true") {
      logger.debug("Skip — already watermarked", { filePath });
      return;
    }
    if (!WATERMARK_PREFIXES.some((p) => filePath.startsWith(p))) {
      logger.debug("Skip — outside watermark scope", { filePath });
      return;
    }

    const file = getStorage().bucket(object.bucket).file(filePath);

    try {
      const [buffer] = await file.download();
      const { width, height } = await sharp(buffer).metadata();
      if (!width || !height) {
        logger.warn("Skip — unreadable image size", { filePath });
        return;
      }

      const fontSize = Math.max(20, Math.floor(height * FONT_SIZE_RATIO));
      const letterSpacing = Math.round(fontSize * 0.18);
      const svg = Buffer.from(`
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

      const out = await sharp(buffer)
        .rotate() // honour EXIF orientation before compositing
        .composite([{ input: svg, top: 0, left: 0, blend: "over" }])
        .toBuffer();

      await file.save(out, {
        resumable: false,
        metadata: {
          contentType,
          cacheControl: "public, max-age=31536000",
          metadata: { [DONE_FLAG]: "true" },
        },
      });

      logger.info("Watermarked", { filePath });
    } catch (err) {
      logger.error("Watermark failed", { filePath, err: String(err) });
    }
  },
);
