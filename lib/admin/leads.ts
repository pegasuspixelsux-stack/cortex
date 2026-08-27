// Lead pipeline (CRM) data layer for /admin/leads. Leads are created by the
// public "Agente" widget (lib/leads.ts); the admin side moves them through
// the Kanban, logs notes, and reassigns them.

import {
  collection,
  doc,
  updateDoc,
  addDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  type Timestamp,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Lead, LeadStage } from "@/lib/leads";

export type { Lead, LeadStage };

/* ---- stage configuration (edit here to reshape the pipeline) -------- */

export interface StageConfig {
  key: LeadStage;
  label: string;
  /** Terminal stages don't accrue staleness. */
  terminal?: boolean;
  tone: "neutral" | "won" | "lost";
}

export const LEAD_STAGES: StageConfig[] = [
  { key: "nuevo", label: "Nuevo lead", tone: "neutral" },
  { key: "contactado", label: "Contactado", tone: "neutral" },
  { key: "visita", label: "Visita agendada", tone: "neutral" },
  { key: "negociacion", label: "Negociación", tone: "neutral" },
  { key: "ganado", label: "Cerrado / Ganado", terminal: true, tone: "won" },
  { key: "perdido", label: "Perdido", terminal: true, tone: "lost" },
];

export const STAGE_LABEL: Record<LeadStage, string> = Object.fromEntries(
  LEAD_STAGES.map((s) => [s.key, s.label]),
) as Record<LeadStage, string>;

/* ---- SLA / staleness ---------------------------------------------- */

const WARN_MS = 24 * 60 * 60 * 1000;
const CRIT_MS = 48 * 60 * 60 * 1000;

export type Staleness = { level: "ok" | "warn" | "crit"; sinceMs: number };

export function staleness(lead: Lead): Staleness {
  const stage = LEAD_STAGES.find((s) => s.key === lead.stage);
  const ts = lead.lastStageChangeAt ?? lead.createdAt;
  if (!ts || stage?.terminal) return { level: "ok", sinceMs: 0 };
  const sinceMs = Date.now() - ts.toMillis();
  if (sinceMs >= CRIT_MS) return { level: "crit", sinceMs };
  if (sinceMs >= WARN_MS) return { level: "warn", sinceMs };
  return { level: "ok", sinceMs };
}

const rtf = new Intl.RelativeTimeFormat("es", { numeric: "auto" });

export function timeAgo(ts: Timestamp | null): string {
  if (!ts) return "—";
  const diffMs = ts.toMillis() - Date.now();
  const mins = Math.round(diffMs / 60000);
  if (Math.abs(mins) < 60) return rtf.format(mins, "minute");
  const hours = Math.round(mins / 60);
  if (Math.abs(hours) < 24) return rtf.format(hours, "hour");
  return rtf.format(Math.round(hours / 24), "day");
}

export type LeadPriority = "Alta" | "Media" | "Baja";

export function leadPriority(score: number): LeadPriority {
  if (score >= 8) return "Alta";
  if (score >= 5) return "Media";
  return "Baja";
}

/* ---- reads / writes ---------------------------------------------- */

function requireDb() {
  if (!db) throw new Error("Firebase no está configurado.");
  return db;
}

/** Realtime subscription to every lead, highest score first. */
export function subscribeLeads(cb: (leads: Lead[]) => void): Unsubscribe {
  const q = query(collection(requireDb(), "leads"), orderBy("score", "desc"));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Lead));
  });
}

export async function updateLeadStage(
  id: string,
  stage: LeadStage,
): Promise<void> {
  await updateDoc(doc(requireDb(), "leads", id), {
    stage,
    lastStageChangeAt: serverTimestamp(),
  });
}

export async function assignLead(
  id: string,
  assignedTo: string | null,
  assignedToName: string | null,
): Promise<void> {
  await updateDoc(doc(requireDb(), "leads", id), { assignedTo, assignedToName });
}

/* ---- notes / activity log -------------------------------------- */

export interface LeadNote {
  id: string;
  body: string;
  authorUid: string;
  authorName: string;
  createdAt: Timestamp | null;
}

export function subscribeLeadNotes(
  leadId: string,
  cb: (notes: LeadNote[]) => void,
): Unsubscribe {
  const q = query(
    collection(requireDb(), "leads", leadId, "notes"),
    orderBy("createdAt", "desc"),
  );
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as LeadNote));
  });
}

export async function addLeadNote(
  leadId: string,
  note: { body: string; authorUid: string; authorName: string },
): Promise<void> {
  await addDoc(collection(requireDb(), "leads", leadId, "notes"), {
    body: note.body.trim(),
    authorUid: note.authorUid,
    authorName: note.authorName,
    createdAt: serverTimestamp(),
  });
}
