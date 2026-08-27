"use client";

import { useEffect, useState } from "react";
import {
  DEFAULT_SITE_SETTINGS,
  cachedSettings,
  subscribeSiteSettings,
  type SiteSettings,
} from "@/lib/siteSettings";

/** Reads the configurable brand logo (settings/site), falling back to the
 *  built-in Cortex mark. Starts from the default (matches SSR), then swaps to
 *  the localStorage cache and the live value on mount. */
function useSiteSettings(): SiteSettings {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  useEffect(() => {
    setSettings(cachedSettings());
    return subscribeSiteSettings(setSettings);
  }, []);
  return settings;
}

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
  const { logoUrl, logoText } = override ?? live;

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

  if (logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logoUrl}
        alt={logoText || "Cortex"}
        className={`h-7 w-auto object-contain ${className ?? ""}`}
      />
    );
  }

  return (
    <span className={`flex items-center gap-2.5 ${className ?? ""}`}>
      <svg
        width="22"
        height="22"
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
      <span className={`text-lg font-light tracking-wide ${textColor}`}>
        {logoText || "Cortex"}
      </span>
    </span>
  );
}
