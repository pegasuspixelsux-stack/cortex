// Global feature flags — a single Firestore doc (settings/features) that
// only a super_admin may write (see firestore.rules). Everyone reads it,
// so the public site and the /admin nav can hide switched-off modules.

"use client";

import { useEffect, useState } from "react";
import {
  doc,
  onSnapshot,
  setDoc,
  serverTimestamp,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface FeatureFlags {
  /** The Remotion reel generator at /admin/content. */
  reelGenerator: boolean;
  /** The public "Agente" lead-qualification widget. */
  leadWidget: boolean;
  /** The (queued) Google Drive bulk photo import. */
  driveImport: boolean;
}

export const DEFAULT_FLAGS: FeatureFlags = {
  // Off until a super_admin turns it on in Configuración — hidden from the
  // rest of the team by default.
  reelGenerator: false,
  leadWidget: true,
  driveImport: false,
};

export const FLAG_LABELS: Record<keyof FeatureFlags, string> = {
  reelGenerator: "Generador de Reels (/admin/content)",
  leadWidget: "Widget Agente (captación pública)",
  driveImport: "Importación masiva desde Google Drive",
};

const CACHE_KEY = "cortex.feature-flags.v1";
const REF = () => doc(db!, "settings", "features");

function cache(f: FeatureFlags) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(f));
  } catch {
    /* ignore */
  }
}

function cached(): FeatureFlags {
  if (typeof window === "undefined") return DEFAULT_FLAGS;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) return { ...DEFAULT_FLAGS, ...JSON.parse(raw) };
  } catch {
    /* ignore */
  }
  return DEFAULT_FLAGS;
}

/** Live subscription. Returns a no-op unsub if Firebase isn't configured. */
export function subscribeFeatureFlags(
  cb: (flags: FeatureFlags) => void,
): Unsubscribe {
  if (!db) return () => undefined;
  return onSnapshot(
    REF(),
    (snap) => {
      const next: FeatureFlags = snap.exists()
        ? { ...DEFAULT_FLAGS, ...(snap.data() as Partial<FeatureFlags>) }
        : DEFAULT_FLAGS;
      cache(next);
      cb(next);
    },
    () => cb(cached()),
  );
}

/** super_admin only — the Firestore rule rejects everyone else. */
export async function updateFeatureFlags(
  patch: Partial<FeatureFlags>,
): Promise<void> {
  if (!db) throw new Error("Firebase no está configurado.");
  await setDoc(
    REF(),
    { ...patch, updatedAt: serverTimestamp() },
    { merge: true },
  );
}

/** Hook: starts from the default (SSR-safe), swaps to cache + live value. */
export function useFeatureFlags(): FeatureFlags {
  const [flags, setFlags] = useState<FeatureFlags>(DEFAULT_FLAGS);
  useEffect(() => {
    setFlags(cached());
    return subscribeFeatureFlags(setFlags);
  }, []);
  return flags;
}
