// Bundles the Remotion project at build time so the /api/render-reel
// serverless function never has to run the bundler (rspack) at runtime —
// it only calls the renderer against this prebuilt directory.

import path from "node:path";
import { bundle } from "@remotion/bundler";

const outDir = path.join(process.cwd(), ".remotion-bundle");

const location = await bundle({
  entryPoint: path.join(process.cwd(), "remotion", "index.ts"),
  outDir,
  onProgress: () => undefined,
});

console.log(`Remotion bundle → ${location}`);
