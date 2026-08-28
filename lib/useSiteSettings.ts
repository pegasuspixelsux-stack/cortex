"use client";

import { useEffect, useState } from "react";
import {
  DEFAULT_SITE_SETTINGS,
  cachedSettings,
  subscribeSiteSettings,
  type SiteSettings,
} from "@/lib/siteSettings";

/**
 * Live global site settings. Starts from the built-in defaults (so SSR and
 * first paint match), then swaps to the localStorage cache and the live
 * Firestore value on mount.
 */
export function useSiteSettings(): SiteSettings {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  useEffect(() => {
    setSettings(cachedSettings());
    return subscribeSiteSettings(setSettings);
  }, []);
  return settings;
}
