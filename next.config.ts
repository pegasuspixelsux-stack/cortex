import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      // Property / brand photos uploaded to Firebase Storage.
      { protocol: "https", hostname: "firebasestorage.googleapis.com" },
      { protocol: "https", hostname: "storage.googleapis.com" },
    ],
  },
  // @remotion/renderer ships native binaries — load it from node_modules at
  // runtime rather than bundling it. The bundler runs at build time only
  // (npm prebuild), so it's not in the serverless function.
  serverExternalPackages: ["@remotion/renderer", "@sparticuz/chromium"],
  outputFileTracingIncludes: {
    "/api/render-reel": [
      "./.remotion-bundle/**/*",
      "./node_modules/@remotion/compositor-*/**/*",
      "./node_modules/@sparticuz/chromium/bin/**/*",
    ],
  },
};

export default nextConfig;
