// Global site configuration — a single Firestore doc (settings/site) that
// the public marketing site reads and the admin edits under
// /admin/settings. Covers brand identity, contact details and the
// editable copy blocks. Public-readable; manager+ write (firestore.rules).

import {
  doc,
  onSnapshot,
  setDoc,
  serverTimestamp,
  deleteField,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export type LogoFont = "sans" | "serif" | "mono";
export const LOGO_FONTS: { value: LogoFont; label: string }[] = [
  { value: "sans", label: "Sans (Geist)" },
  { value: "serif", label: "Serif (Fraunces)" },
  { value: "mono", label: "Mono" },
];

export type LogoType = "text" | "image";

export interface SiteSettings {
  /** "text" shows the wordmark; "image" shows `logoImage` when present. */
  logoType: LogoType;
  /** Image logo (PNG/SVG in Firebase Storage). */
  logoImage?: string;
  logoText: string;
  logoFont: LogoFont;
  /** Wordmark font size in px; the mark + any image scale with it. */
  logoSize: number;

  phone: string;
  whatsapp: string;
  address: string;
  email: string;

  /** Hero headline (public homepage). `\n` renders as a line break. */
  headingText: string;
  /** Hero supporting paragraph. */
  supportHeadingText: string;
  /** Institutional copy for the "Nosotros" section + page. */
  nosotrosText: string;
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  logoType: "text",
  logoText: "Cortex",
  logoFont: "sans",
  logoSize: 18,
  phone: "+598 42 00 0000",
  whatsapp: "+598 99 000 000",
  address: "Av. Roosevelt, Parada 5, Punta del Este, Uruguay",
  email: "contacto@cortexrealestate.com",
  headingText:
    "Redefiniendo el espacio,\nelevando la experiencia\nen Punta del Este",
  supportHeadingText:
    "Conectamos exclusividad, arquitectura de autor y oportunidades únicas frente al mar en los destinos más codiciados de Uruguay.",
  nosotrosText:
    "En Cortex, entendemos que una propiedad no es solo una transacción, es el refugio definitivo y la inversión de una vida. Operamos en el corazón de Punta del Este con un enfoque analítico, discreto y de diseño superior, gestionando los activos inmobiliarios más selectos de la costa atlántica.",
};

const CACHE_KEY = "cortex.site-settings.v2";
const REF = () => doc(db!, "settings", "site");

/** Digits only — for wa.me / tel: hrefs. */
export function digits(raw: string): string {
  return (raw ?? "").replace(/\D/g, "");
}

function normalize(data: Record<string, unknown>): SiteSettings {
  const merged = { ...DEFAULT_SITE_SETTINGS, ...data } as SiteSettings & {
    logoUrl?: string;
  };
  // Back-compat: the field used to be `logoUrl`.
  if (!merged.logoImage && merged.logoUrl) merged.logoImage = merged.logoUrl;
  return merged;
}

/** Last known settings — seeded from localStorage so nothing flashes. */
export function cachedSettings(): SiteSettings {
  if (typeof window === "undefined") return DEFAULT_SITE_SETTINGS;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) return normalize(JSON.parse(raw));
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
      const next = snap.exists()
        ? normalize(snap.data() as Record<string, unknown>)
        : DEFAULT_SITE_SETTINGS;
      cache(next);
      cb(next);
    },
    () => cb(cachedSettings()),
  );
}

export type SiteSettingsPatch = Partial<
  Omit<SiteSettings, "logoImage">
> & {
  /** A URL sets the image; "" clears it; undefined leaves it. */
  logoImage?: string;
};

export async function updateSiteSettings(patch: SiteSettingsPatch): Promise<void> {
  if (!db) throw new Error("Firebase no está configurado.");
  const data: Record<string, unknown> = { updatedAt: serverTimestamp() };
  for (const [key, value] of Object.entries(patch)) {
    if (value === undefined) continue;
    if (key === "logoImage") {
      data.logoImage = value ? value : deleteField();
    } else {
      data[key] = value;
    }
  }
  await setDoc(REF(), data, { merge: true });
}
