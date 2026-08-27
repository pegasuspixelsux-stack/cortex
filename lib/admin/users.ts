// Firestore-backed user directory + role assignment for the /admin
// module. User profiles live in Firestore's `users/{uid}` docs, keyed by
// the Firebase Auth UID, so role lookups can join cleanly against auth.

import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  type Timestamp,
} from "firebase/firestore";
import { createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { db, getSecondaryAuth } from "@/lib/firebase";

export type UserRole = "admin" | "editor" | "viewer";

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Administrador Total",
  editor: "Editor / Agente",
  viewer: "Viewer / Invitado",
};

export interface AdminUser {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Timestamp | null;
}

const COLLECTION = "users";

function requireDb() {
  if (!db) throw new Error("Firebase no está configurado.");
  return db;
}

export async function listUsers(): Promise<AdminUser[]> {
  const q = query(collection(requireDb(), COLLECTION), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ uid: d.id, ...d.data() }) as AdminUser);
}

/**
 * Creates a real Firebase Auth account (email + temporary password) and
 * its matching Firestore profile/role doc. Uses a secondary, throwaway
 * Firebase App instance so the admin performing the action stays signed
 * in — see the comment on `getSecondaryAuth` in lib/firebase.ts.
 */
export async function createUser(input: {
  name: string;
  email: string;
  tempPassword: string;
  role: UserRole;
}): Promise<string> {
  const secondaryAuth = getSecondaryAuth();
  if (!secondaryAuth) throw new Error("Firebase no está configurado.");

  const credential = await createUserWithEmailAndPassword(
    secondaryAuth,
    input.email,
    input.tempPassword,
  );
  await signOut(secondaryAuth);

  const uid = credential.user.uid;
  await setDoc(doc(requireDb(), COLLECTION, uid), {
    name: input.name,
    email: input.email,
    role: input.role,
    createdAt: serverTimestamp(),
  });

  return uid;
}

export async function updateUserRole(uid: string, role: UserRole): Promise<void> {
  await updateDoc(doc(requireDb(), COLLECTION, uid), { role });
}

/**
 * Removes the Firestore profile only. Deleting the underlying Firebase
 * Auth account requires the Admin SDK (service account, server-side) —
 * the client SDK can only delete the *currently signed-in* user, not an
 * arbitrary one. Wire that up via a server route if full deletion is
 * needed later.
 */
export async function deleteUserProfile(uid: string): Promise<void> {
  await deleteDoc(doc(requireDb(), COLLECTION, uid));
}
