// "Agente" — the Cortex virtual concierge. Lead qualification config, the
// silent scoring engine, and the client-side write to Firestore's `leads`
// collection. The question sets below are the single source of truth for
// what the widget asks — edit here to reconfigure the flow.

import {
  collection,
  addDoc,
  serverTimestamp,
  type Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ZONES, type Zone } from "@/lib/properties";

export type { Zone };
export { ZONES };

/* ------------------------------------------------------------------ */
/*  Question configuration                                             */
/* ------------------------------------------------------------------ */

export type TransactionType = "Comprar" | "Alquiler anual" | "Alquiler de temporada";

export type LeadPropertyType =
  | "Casa de autor"
  | "Penthouse"
  | "Chacra / Terreno"
  | "Apartamento"
  | "Desarrollo en pozo";

export type Budget =
  | "Menos de $500k"
  | "$500k – $1.5M"
  | "$1.5M – $3M"
  | "Más de $3M";

export type Timeframe =
  | "Inmediato / Menos de 3 meses"
  | "De 3 a 6 meses"
  | "Exploratorio / Más de 6 meses";

export type Obstacle =
  | "Transferencia internacional de fondos"
  | "Venta previa de otro inmueble"
  | "Asesoramiento fiscal / legal"
  | "Ninguno";

export type ContactPreference = "WhatsApp" | "Llamada telefónica" | "Email";

export type ContactWindow = "Mañana" | "Tarde" | "Noche" | "Inmediato";

export const TRANSACTION_TYPES: TransactionType[] = [
  "Comprar",
  "Alquiler anual",
  "Alquiler de temporada",
];

export const LEAD_PROPERTY_TYPES: LeadPropertyType[] = [
  "Casa de autor",
  "Penthouse",
  "Chacra / Terreno",
  "Apartamento",
  "Desarrollo en pozo",
];

export const BUDGETS: Budget[] = [
  "Menos de $500k",
  "$500k – $1.5M",
  "$1.5M – $3M",
  "Más de $3M",
];

export const TIMEFRAMES: Timeframe[] = [
  "Inmediato / Menos de 3 meses",
  "De 3 a 6 meses",
  "Exploratorio / Más de 6 meses",
];

export const OBSTACLES: Obstacle[] = [
  "Transferencia internacional de fondos",
  "Venta previa de otro inmueble",
  "Asesoramiento fiscal / legal",
  "Ninguno",
];

export const CONTACT_PREFERENCES: ContactPreference[] = [
  "WhatsApp",
  "Llamada telefónica",
  "Email",
];

export const CONTACT_WINDOWS: ContactWindow[] = [
  "Mañana",
  "Tarde",
  "Noche",
  "Inmediato",
];

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

/** Answers collected as the visitor moves through the widget. */
export interface LeadDraft {
  transactionType?: TransactionType;
  zones: Zone[];
  propertyType?: LeadPropertyType;
  budget?: Budget;
  timeframe?: Timeframe;
  obstacles: Obstacle[];
  name: string;
  email: string;
  phone: string;
  contactPreference?: ContactPreference;
  contactWindow?: ContactWindow;
}

export const EMPTY_DRAFT: LeadDraft = {
  zones: [],
  obstacles: [],
  name: "",
  email: "",
  phone: "",
};

/** Pipeline stages for the /admin/leads Kanban. */
export type LeadStage =
  | "nuevo"
  | "contactado"
  | "visita"
  | "negociacion"
  | "ganado"
  | "perdido";

export type ScoreBreakdown = {
  timeframe: number;
  budget: number;
  zone: number;
  propertyType: number;
  transaction: number;
  contact: number;
};

/** A persisted lead — draft answers plus the computed score and metadata. */
export interface Lead {
  id: string;
  transactionType: TransactionType | null;
  zones: Zone[];
  propertyType: LeadPropertyType | null;
  budget: Budget | null;
  timeframe: Timeframe | null;
  obstacles: Obstacle[];
  name: string;
  email: string;
  phone: string | null;
  contactPreference: ContactPreference | null;
  contactWindow: ContactWindow | null;
  score: number;
  scoreBreakdown: ScoreBreakdown;
  stage: LeadStage;
  /** Set whenever the stage changes — drives the SLA / staleness alerts. */
  lastStageChangeAt: Timestamp | null;
  assignedTo: string | null;
  assignedToName: string | null;
  createdAt: Timestamp | null;
}

/* ------------------------------------------------------------------ */
/*  Scoring engine — pure, silent, 1–10                                */
/* ------------------------------------------------------------------ */

/** Loose international phone check: 8–15 digits, optional leading +. */
export function isPlausiblePhone(raw: string): boolean {
  const digits = raw.replace(/[^\d]/g, "");
  return digits.length >= 8 && digits.length <= 15;
}

const TIMEFRAME_POINTS: Record<Timeframe, number> = {
  "Inmediato / Menos de 3 meses": 3,
  "De 3 a 6 meses": 2,
  "Exploratorio / Más de 6 meses": 1,
};

const BUDGET_POINTS: Record<Budget, number> = {
  "Más de $3M": 3,
  "$1.5M – $3M": 3,
  "$500k – $1.5M": 2,
  "Menos de $500k": 1,
};

const TRANSACTION_POINTS: Record<TransactionType, number> = {
  Comprar: 1,
  "Alquiler anual": 0.5,
  "Alquiler de temporada": 0.25,
};

/**
 * Silent qualification score. Weighted sum of intent signals, clamped to
 * 1–10 and rounded. Returns the per-factor breakdown so the sales team can
 * see *why* a lead ranks where it does.
 */
export function scoreLead(draft: LeadDraft): {
  score: number;
  breakdown: ScoreBreakdown;
} {
  const breakdown: ScoreBreakdown = {
    timeframe: draft.timeframe ? TIMEFRAME_POINTS[draft.timeframe] : 0,
    budget: draft.budget ? BUDGET_POINTS[draft.budget] : 0,
    zone:
      draft.zones.length === 0
        ? 0
        : draft.zones.length <= 2
          ? 1
          : 0.5,
    propertyType: draft.propertyType ? 1 : 0,
    transaction: draft.transactionType
      ? TRANSACTION_POINTS[draft.transactionType]
      : 0,
    contact:
      (isPlausiblePhone(draft.phone) ? 1 : 0) +
      (draft.contactPreference && draft.contactWindow ? 0.5 : 0) +
      (draft.email.trim() ? 0.5 : 0),
  };

  const raw = Object.values(breakdown).reduce((sum, n) => sum + n, 0);
  const score = Math.min(10, Math.max(1, Math.round(raw)));

  return { score, breakdown };
}

/* ------------------------------------------------------------------ */
/*  Persistence + handoff                                              */
/* ------------------------------------------------------------------ */

function requireDb() {
  if (!db) throw new Error("Firebase no está configurado.");
  return db;
}

/** Writes the qualified lead to Firestore and returns its new id. */
export async function createLead(draft: LeadDraft): Promise<string> {
  const { score, breakdown } = scoreLead(draft);
  const ref = await addDoc(collection(requireDb(), "leads"), {
    transactionType: draft.transactionType ?? null,
    zones: draft.zones,
    propertyType: draft.propertyType ?? null,
    budget: draft.budget ?? null,
    timeframe: draft.timeframe ?? null,
    obstacles: draft.obstacles,
    name: draft.name.trim(),
    email: draft.email.trim(),
    phone: draft.phone.trim() || null,
    contactPreference: draft.contactPreference ?? null,
    contactWindow: draft.contactWindow ?? null,
    score,
    scoreBreakdown: breakdown,
    stage: "nuevo",
    lastStageChangeAt: serverTimestamp(),
    assignedTo: null,
    assignedToName: null,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

/** Sales-team WhatsApp line. Placeholder — matches the Footer number. */
export const SALES_WHATSAPP = "59899000000";

/** Prefilled WhatsApp handoff message. Never includes the lead score. */
export function buildWhatsappUrl(draft: LeadDraft): string {
  const parts = [
    `Hola, soy ${draft.name.trim() || "un interesado"}. Completé el perfil con el Agente de Cortex.`,
    draft.transactionType && `Operación: ${draft.transactionType}.`,
    draft.zones.length && `Zonas: ${draft.zones.join(", ")}.`,
    draft.propertyType && `Tipología: ${draft.propertyType}.`,
    draft.budget && `Presupuesto: ${draft.budget}.`,
    draft.timeframe && `Plazo: ${draft.timeframe}.`,
    draft.contactPreference &&
      draft.contactWindow &&
      `Prefiero ${draft.contactPreference} en horario de ${draft.contactWindow.toLowerCase()}.`,
  ].filter(Boolean);

  return `https://wa.me/${SALES_WHATSAPP}?text=${encodeURIComponent(parts.join(" "))}`;
}
