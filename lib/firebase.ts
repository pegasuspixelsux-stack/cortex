// Firebase client initialization for the /admin module (Auth, Firestore,
// Storage). The public marketing site does not use Firebase — only the
// admin dashboard reads/writes it.
//
// Guarded on purpose: if the NEXT_PUBLIC_FIREBASE_* env vars aren't set
// (e.g. before the project owner has created a real Firebase project),
// `auth`/`db`/`storage` are null instead of throwing, so the rest of the
// app keeps building and running. Admin pages check `isFirebaseConfigured`
// and render a friendly fallback instead of crashing.

import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId,
);

let app: FirebaseApp | null = null;
export let auth: Auth | null = null;
export let db: Firestore | null = null;
export let storage: FirebaseStorage | null = null;

if (isFirebaseConfigured) {
  app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
}

/**
 * A second, independent Firebase App instance used only to create new
 * Auth users from the admin "Add user" form. `createUserWithEmailAndPassword`
 * on the *primary* app signs the browser in as the newly created user,
 * which would kick the admin out of their own session — using a secondary
 * app avoids that. Its own auth session is never persisted or used
 * elsewhere. (The more robust production pattern is a server route backed
 * by the `firebase-admin` SDK and a service account, which never touches
 * the browser session at all — worth moving to later.)
 */
export function getSecondaryAuth(): Auth | null {
  if (!isFirebaseConfigured) return null;
  const existing = getApps().find((a) => a.name === "Secondary");
  const secondaryApp =
    existing ?? initializeApp(firebaseConfig, "Secondary");
  return getAuth(secondaryApp);
}
