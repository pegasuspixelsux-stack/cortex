// Saved reel-styling presets for /admin/content. localStorage is the source
// of truth (instant, offline); Firestore (users/<uid>/contentPresets) is a
// best-effort cross-device sync. The 5 system presets can't be deleted, only
// applied or cloned.

import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { PRESETS, type Preset } from "@/remotion/presets";
import type {
  FilmBurnConfig,
  LineId,
  LogoConfig,
  OverlayConfig,
  PropertyReelProps,
  TextLine,
  TransitionKind,
} from "@/remotion/constants";

/** Everything a preset captures — styling only, no property text/photos. */
export interface ContentPresetConfig {
  lines: Record<LineId, Omit<TextLine, "id" | "text">>;
  logo: LogoConfig;
  topOverlay: OverlayConfig;
  bottomOverlay: OverlayConfig;
  transition: TransitionKind;
  filmBurn: FilmBurnConfig;
}

export interface SavedPreset {
  id: string;
  name: string;
  config: ContentPresetConfig;
  system?: boolean;
  updatedAt: number;
}

const KEY = "cortex.content-presets.v1";

/* ---- config <-> reel ---------------------------------------------- */

export function extractConfig(reel: PropertyReelProps): ContentPresetConfig {
  return {
    lines: Object.fromEntries(
      reel.lines.map((l) => {
        const { id: _id, text: _text, ...style } = l;
        return [l.id, style];
      }),
    ) as ContentPresetConfig["lines"],
    logo: { ...reel.logo },
    topOverlay: { ...reel.topOverlay },
    bottomOverlay: { ...reel.bottomOverlay },
    transition: reel.transition,
    filmBurn: { ...reel.filmBurn },
  };
}

export function applyConfig(
  reel: PropertyReelProps,
  config: ContentPresetConfig,
): PropertyReelProps {
  return {
    ...reel,
    lines: reel.lines.map((l) => ({
      id: l.id,
      text: l.text,
      ...config.lines[l.id],
    })),
    logo: {
      ...config.logo,
      // Keep the current logo image if the preset didn't ship one.
      url: config.logo.url ?? reel.logo.url,
    },
    topOverlay: { ...config.topOverlay },
    bottomOverlay: { ...config.bottomOverlay },
    transition: config.transition,
    filmBurn: { ...config.filmBurn },
  };
}

/* ---- system presets --------------------------------------------- */

function presetToConfig(p: Preset): ContentPresetConfig {
  return {
    lines: p.lines,
    logo: { ...p.logo, url: undefined },
    topOverlay: p.topOverlay,
    bottomOverlay: p.bottomOverlay,
    transition: p.transition,
    filmBurn: p.filmBurn,
  };
}

export const SYSTEM_PRESETS: SavedPreset[] = PRESETS.map((p) => ({
  id: `system:${p.key}`,
  name: p.label,
  config: presetToConfig(p),
  system: true,
  updatedAt: 0,
}));

/* ---- local storage --------------------------------------------- */

function readLocal(): SavedPreset[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as SavedPreset[];
    return Array.isArray(arr) ? arr.filter((p) => !p.system) : [];
  } catch {
    return [];
  }
}

function writeLocal(userPresets: SavedPreset[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(userPresets));
  } catch {
    /* quota / private mode */
  }
}

/* ---- firestore sync (best-effort) ------------------------------ */

function col(uid: string) {
  return collection(db!, "users", uid, "contentPresets");
}

async function pushToFirestore(uid: string, p: SavedPreset) {
  if (!db) return;
  try {
    await setDoc(doc(col(uid), p.id), {
      name: p.name,
      config: p.config,
      updatedAt: p.updatedAt,
    });
  } catch {
    /* offline / rules — localStorage still has it */
  }
}

async function removeFromFirestore(uid: string, id: string) {
  if (!db) return;
  try {
    await deleteDoc(doc(col(uid), id));
  } catch {
    /* ignore */
  }
}

/* ---- public API ---------------------------------------------- */

/**
 * All presets the agent can use: the 5 system ones plus their saved ones.
 * Merges localStorage with Firestore (newer `updatedAt` wins) and writes the
 * merge back locally.
 */
export async function loadPresets(uid: string | null): Promise<SavedPreset[]> {
  const local = readLocal();
  const byId = new Map(local.map((p) => [p.id, p]));

  if (uid && db) {
    try {
      const snap = await getDocs(col(uid));
      for (const d of snap.docs) {
        const remote = { id: d.id, ...d.data() } as SavedPreset;
        const existing = byId.get(remote.id);
        if (!existing || remote.updatedAt >= existing.updatedAt) {
          byId.set(remote.id, remote);
        }
      }
    } catch {
      /* offline — local only */
    }
  }

  const user = [...byId.values()].sort((a, b) => b.updatedAt - a.updatedAt);
  writeLocal(user);
  return [...SYSTEM_PRESETS, ...user];
}

export async function savePreset(
  uid: string | null,
  name: string,
  config: ContentPresetConfig,
): Promise<SavedPreset> {
  const preset: SavedPreset = {
    id:
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}`,
    name: name.trim() || "Preset sin nombre",
    config,
    updatedAt: Date.now(),
  };
  writeLocal([preset, ...readLocal()]);
  if (uid) void pushToFirestore(uid, preset);
  return preset;
}

export async function renamePreset(
  uid: string | null,
  id: string,
  name: string,
): Promise<void> {
  const next = readLocal().map((p) =>
    p.id === id ? { ...p, name: name.trim() || p.name, updatedAt: Date.now() } : p,
  );
  writeLocal(next);
  const updated = next.find((p) => p.id === id);
  if (uid && updated) void pushToFirestore(uid, updated);
}

export async function deletePreset(
  uid: string | null,
  id: string,
): Promise<void> {
  writeLocal(readLocal().filter((p) => p.id !== id));
  if (uid) void removeFromFirestore(uid, id);
}
