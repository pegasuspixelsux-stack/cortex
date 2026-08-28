"use client";

import { useSiteSettings } from "@/lib/useSiteSettings";
import type { SiteSettings } from "@/lib/siteSettings";

interface SiteLogoProps {
  /** "overlay" = light type on a photo; "solid" = interior/footer. */
  variant?: "overlay" | "solid" | "footer";
  className?: string;
  /** Force specific settings instead of the live ones (e.g. an editor preview). */
  settings?: SiteSettings;
}

export default function SiteLogo({
  variant = "solid",
  className,
  settings: override,
}: SiteLogoProps) {
  const live = useSiteSettings();
  const { logoType, logoImage, logoText, logoFont, logoSize } = override ?? live;
  const fontClass =
    logoFont === "serif"
      ? "font-serif"
      : logoFont === "mono"
        ? "font-mono"
        : "font-sans";

  const markColor =
    variant === "overlay"
      ? "text-white"
      : variant === "footer"
        ? "text-terracotta-dark"
        : "text-terracotta";
  const textColor =
    variant === "overlay"
      ? "text-white"
      : variant === "footer"
        ? "text-cream"
        : "text-foreground";

  if (logoType === "image" && logoImage) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logoImage}
        alt={logoText || "Cortex"}
        style={{ height: Math.round(logoSize * 1.6) }}
        className={`w-auto object-contain ${className ?? ""}`}
      />
    );
  }

  const mark = Math.round(logoSize * 1.2);
  return (
    <span
      className={`flex items-center ${className ?? ""}`}
      style={{ gap: Math.round(logoSize * 0.55) }}
    >
      <svg
        width={mark}
        height={mark}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={markColor}
      >
        <rect x="2" y="2" width="8" height="8" fill="currentColor" />
        <rect x="14" y="2" width="8" height="8" fill="currentColor" />
        <rect x="2" y="14" width="8" height="8" fill="currentColor" />
        <rect x="14" y="14" width="8" height="8" fill="currentColor" />
      </svg>
      <span
        className={`font-light tracking-wide ${fontClass} ${textColor}`}
        style={{ fontSize: logoSize }}
      >
        {logoText || "Cortex"}
      </span>
    </span>
  );
}
