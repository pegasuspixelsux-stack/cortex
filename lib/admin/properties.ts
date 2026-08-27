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

export interface AdminProperty {
  id: string;
  title: string;
  description: string;
  price: number;
  zone: string;
  type: string;
  sqm: number;
  beds: number;
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
