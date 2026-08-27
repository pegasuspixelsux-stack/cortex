// Firebase Storage helpers — property photos and agent headshots uploaded
// from the admin.

import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { storage } from "@/lib/firebase";

/**
 * Uploads a file under `folder/` (e.g. "properties" or
 * "properties/<id>/imported") with a collision-safe filename, and returns
 * its public download URL.
 */
export async function uploadImage(file: File, folder: string): Promise<string> {
  if (!storage) throw new Error("Firebase no está configurado.");
  const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}`;
  const fileRef = ref(storage, `${folder}/${filename}`);
  const snapshot = await uploadBytes(fileRef, file);
  return getDownloadURL(snapshot.ref);
}

/**
 * Best-effort delete of a Storage object from its download URL. Silently
 * ignores URLs that don't point at this bucket (e.g. pasted Unsplash links)
 * and objects that are already gone.
 */
export async function deleteImageByUrl(url: string): Promise<void> {
  if (!storage) return;
  if (!url.includes("firebasestorage.googleapis.com")) return;
  try {
    await deleteObject(ref(storage, url));
  } catch {
    /* already deleted or not ours — nothing to do */
  }
}
