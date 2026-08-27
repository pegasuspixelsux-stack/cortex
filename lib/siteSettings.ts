// Public site settings — a single Firestore doc (settings/site) that the
// marketing site reads and the admin edits. Right now: the brand logo.

import {
  doc,
  onSnapshot,
  setDoc,
  serverTimestamp,
  deleteField,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface SiteSettings {
  /** Image logo. When unset, the built-in mark + `logoText` is shown. */
  logoUrl?: string;
  logoText: string;
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = { logoText: "Cortex" };

const CACHE_KEY = "cortex.site-settings.v1";
const REF = () => doc(db!, "settings", "site");

/** Last known settings — seeded from localStorage so the logo doesn't flash. */
export function cachedSettings(): SiteSettings {
  if (typeof window === "undefined") return DEFAULT_SITE_SETTINGS;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) return { ...DEFAULT_SITE_SETTINGS, ...JSON.parse(raw) };
  } catch {
    /* ignore */
  }
  return DEFAULT_SITE_SETTINGS;
}

function cache(s: SiteSettings) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
}

/** Live subscription. Returns a no-op unsub if Firebase isn't configured. */
export function subscribeSiteSettings(
  cb: (settings: SiteSettings) => void,
): Unsubscribe {
  if (!db) return () => undefined;
  return onSnapshot(
    REF(),
    (snap) => {
      const next: SiteSettings = snap.exists()
        ? { ...DEFAULT_SITE_SETTINGS, ...(snap.data() as Partial<SiteSettings>) }
        : DEFAULT_SITE_SETTINGS;
      cache(next);
      cb(next);
    },
    () => cb(cachedSettings()),
  );
}

export async function updateSiteSettings(patch: {
  logoText?: string;
  /** A URL sets the image; an empty string clears it; undefined leaves it. */
  logoUrl?: string;
}): Promise<void> {
  if (!db) throw new Error("Firebase no está configurado.");
  const data: Record<string, unknown> = { updatedAt: serverTimestamp() };
  if (patch.logoText !== undefined) data.logoText = patch.logoText;
  if (patch.logoUrl !== undefined) {
    data.logoUrl = patch.logoUrl ? patch.logoUrl : deleteField();
  }
  await setDoc(REF(), data, { merge: true });
}
