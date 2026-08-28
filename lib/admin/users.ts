// Firestore-backed user directory + role assignment for the /admin
// module. User profiles live in Firestore's `users/{uid}` docs, keyed by
// the Firebase Auth UID, so role lookups can join cleanly against auth.
//
// RBAC hierarchy (see firestore.rules for the enforced version):
//
//   super_admin  rank 4  — absolute; hidden from every management UI and
//                          from listUsers(). Created out-of-band only
//                          (Firebase Console), never from the client.
//   admin        rank 3  — full platform; can mint managers + agents.
//   manager      rank 2  — supervises the pipeline/team; mints agents ONLY.
//   agent        rank 1  — operative end user; cannot self-register.

import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  type Timestamp,
} from "firebase/firestore";
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
} from "firebase/auth";
import { auth, db, getSecondaryAuth } from "@/lib/firebase";

export type UserRole = "super_admin" | "admin" | "manager" | "agent";

export const ROLE_RANK: Record<UserRole, number> = {
  super_admin: 4,
  admin: 3,
  manager: 2,
  agent: 1,
};

export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: "Super Admin",
  admin: "Administrador",
  manager: "Manager",
  agent: "Asesor Inmobiliario",
};

/** Roles that ever appear in the directory + role pickers. super_admin is
 *  deliberately absent — it must stay invisible to every other role. */
export const MANAGEABLE_ROLES: UserRole[] = ["admin", "manager", "agent"];

/**
 * The roles a given actor is allowed to grant when inviting or editing a
 * member. Mirrors the `create`/`update` clauses in firestore.rules.
 */
export function assignableRoles(actor: UserRole | null): UserRole[] {
  if (actor === "super_admin" || actor === "admin") return ["manager", "agent"];
  if (actor === "manager") return ["agent"];
  return [];
}

/** Whether the actor can open the user-management area at all. */
export function canManageUsers(actor: UserRole | null): boolean {
  return !!actor && ROLE_RANK[actor] >= ROLE_RANK.manager;
}

/** Whether `actor` outranks `target` (may edit/delete that member). */
export function outranks(actor: UserRole | null, target: UserRole): boolean {
  return !!actor && ROLE_RANK[actor] > ROLE_RANK[target];
}

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

/**
 * Lists the team directory. The `role in [...]` filter keeps super_admin
 * docs out of the result set entirely — both here and in the Firestore
 * `list` rule, which rejects any query that could surface one.
 */
export async function listUsers(): Promise<AdminUser[]> {
  const q = query(
    collection(requireDb(), COLLECTION),
    where("role", "in", MANAGEABLE_ROLES),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs
    .map((d) => ({ uid: d.id, ...d.data() }) as AdminUser)
    .sort((a, b) => (b.createdAt?.toMillis() ?? 0) - (a.createdAt?.toMillis() ?? 0));
}

/**
 * Creates a real Firebase Auth account (email + temporary password) and
 * its matching Firestore profile/role doc. Uses a secondary, throwaway
 * Firebase App instance so the admin performing the action stays signed
 * in — see the comment on `getSecondaryAuth` in lib/firebase.ts.
 *
 * The `setDoc` runs as the *inviter*, so firestore.rules checks their
 * rank against `role`: an agent can never reach this (no UI), a manager
 * may only pass `role: "agent"`.
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
 * Sends Firebase's built-in "reset your password" email so a freshly
 * invited member can set their own password instead of using the
 * throwaway one. Uses the primary auth instance (the email trigger
 * doesn't depend on who is signed in). No-ops loudly if unconfigured.
 */
export async function sendPasswordSetupEmail(email: string): Promise<void> {
  if (!auth) throw new Error("Firebase no está configurado.");
  await sendPasswordResetEmail(auth, email);
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
