"use client";

import Image, { type ImageProps } from "next/image";

/**
 * next/image with casual-copy deterrents: no right-click "save image as",
 * no drag-to-desktop, no selection. This is a soft layer only — anyone can
 * still pull the file from the network tab. The real protection is the
 * server-side "CORTEX" watermark (functions/index.js).
 */
export default function ProtectedImage({ className, ...props }: ImageProps) {
  return (
    <Image
      {...props}
      draggable={false}
      onDragStart={(e) => e.preventDefault()}
      onContextMenu={(e) => e.preventDefault()}
      className={`select-none ${className ?? ""}`}
    />
  );
}
