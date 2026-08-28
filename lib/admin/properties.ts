// Firestore-backed properties for the /admin module. Separate from the
// public site's mock dataset in lib/properties.ts — this is the "real"
// collection admins publish to going forward.

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  orderBy,
  limit as fsLimit,
  serverTimestamp,
  type QueryConstraint,
  type Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export type AdminPropertyStatus = "Publicada" | "Borrador";

export type OperationType = "Venta" | "Alquiler";

export const OPERATION_TYPES: OperationType[] = ["Venta", "Alquiler"];

/** Rental sub-terms — shown only when operation is "Alquiler". */
export type RentalTerm =
  | "1era Quincena de Diciembre"
  | "2da Quincena de Diciembre"
  | "1era Quincena de Enero"
  | "2da Quincena de Enero"
  | "1era Quincena de Febrero"
  | "2da Quincena de Febrero"
  | "Por Mes"
  | "Alquiler Anual";

export const RENTAL_TERMS: RentalTerm[] = [
  "1era Quincena de Diciembre",
  "2da Quincena de Diciembre",
  "1era Quincena de Enero",
  "2da Quincena de Enero",
  "1era Quincena de Febrero",
  "2da Quincena de Febrero",
  "Por Mes",
  "Alquiler Anual",
];

export interface AdminProperty {
  id: string;
  title: string;
  description: string;
  price: number;
  zone: string;
  type: string;
  operation: OperationType;
  /** Empty unless operation === "Alquiler". */
  rentalTerms: RentalTerm[];
  sqm: number;
  beds: number;
  /** Optional — older listings don't store it; estimateBaths() fills in. */
  baths?: number;
  images: string[];
  agentName?: string;
  status: AdminPropertyStatus;
  createdAt: Timestamp | null;
}

export type AdminPropertyInput = Omit<AdminProperty, "id" | "createdAt">;

const COLLECTION = "properties";

function requireDb() {
  if (!db) throw new Error("Firebase no está configurado.");
  return db;
}

export async function listProperties(max?: number): Promise<AdminProperty[]> {
  const constraints: QueryConstraint[] = [orderBy("createdAt", "desc")];
  if (max) constraints.push(fsLimit(max));
  const q = query(collection(requireDb(), COLLECTION), ...constraints);
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as AdminProperty);
}

export async function getProperty(id: string): Promise<AdminProperty | null> {
  const snapshot = await getDoc(doc(requireDb(), COLLECTION, id));
  return snapshot.exists()
    ? ({ id: snapshot.id, ...snapshot.data() } as AdminProperty)
    : null;
}

export async function createProperty(
  input: AdminPropertyInput,
): Promise<string> {
  const ref = await addDoc(collection(requireDb(), COLLECTION), {
    ...input,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateProperty(
  id: string,
  input: Partial<AdminPropertyInput>,
): Promise<void> {
  await updateDoc(doc(requireDb(), COLLECTION, id), input);
}

export async function deleteProperty(id: string): Promise<void> {
  await deleteDoc(doc(requireDb(), COLLECTION, id));
}

/* ---- reel text helpers -------------------------------------------------- */
// Used by the content generator to auto-fill the "specs" and "operation"
// text lines from a selected property. Kept here so the formatting lives
// next to the data model.

/** Bathroom count: the stored value, or the same estimate the public site
 *  uses (lib/properties.ts:getPropertyBaths) when none was entered. */
export function estimateBaths(p: Pick<AdminProperty, "beds" | "baths">): number {
  if (typeof p.baths === "number" && p.baths > 0) return p.baths;
  return p.beds > 0 ? Math.max(1, Math.round(p.beds * 0.75)) : 0;
}

/** e.g. "3 Dormitorios | 2 Baños | 120 m²" (skips any zero part). */
export function formatSpecsLine(
  p: Pick<AdminProperty, "beds" | "baths" | "sqm">,
): string {
  const baths = estimateBaths(p);
  const parts: string[] = [];
  if (p.beds > 0)
    parts.push(`${p.beds} ${p.beds === 1 ? "Dormitorio" : "Dormitorios"}`);
  if (baths > 0) parts.push(`${baths} ${baths === 1 ? "Baño" : "Baños"}`);
  if (p.sqm > 0) parts.push(`${p.sqm.toLocaleString("es-UY")} m²`);
  return parts.join("  |  ");
}

/** e.g. "Venta" or "Alquiler • 1era Quincena de Enero". */
export function formatOperationLine(
  p: Pick<AdminProperty, "operation" | "rentalTerms">,
): string {
  if (p.operation !== "Alquiler") return "Venta";
  const terms = p.rentalTerms ?? [];
  return terms.length ? `Alquiler • ${terms.join(" / ")}` : "Alquiler";
}
