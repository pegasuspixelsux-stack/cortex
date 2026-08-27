// Firestore-backed lead directory for the /admin/leads triage board.
// Leads are written by the public "Agente" widget (see lib/leads.ts); the
// admin side only reads them and moves them through the pipeline.

import {
  collection,
  doc,
  updateDoc,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Lead, LeadStatus } from "@/lib/leads";

export type { Lead, LeadStatus };

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  nuevo: "Nuevo",
  contactado: "Contactado",
  descartado: "Descartado",
};

export type LeadPriority = "Alta" | "Media" | "Baja";

export function leadPriority(score: number): LeadPriority {
  if (score >= 8) return "Alta";
  if (score >= 5) return "Media";
  return "Baja";
}

function requireDb() {
  if (!db) throw new Error("Firebase no está configurado.");
  return db;
}

/** All leads, highest score first. */
export async function listLeads(): Promise<Lead[]> {
  const q = query(collection(requireDb(), "leads"), orderBy("score", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Lead);
}

export async function updateLeadStatus(
  id: string,
  status: LeadStatus,
): Promise<void> {
  await updateDoc(doc(requireDb(), "leads", id), { status });
}
