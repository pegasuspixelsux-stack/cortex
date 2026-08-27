// Firebase Storage upload helper — used for property photos and agent
// headshots uploaded from the admin.

import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";

/**
 * Uploads a file under `folder/` (e.g. "properties" or "agents") with a
 * collision-safe filename, and returns its public download URL.
 */
export async function uploadImage(file: File, folder: string): Promise<string> {
  if (!storage) throw new Error("Firebase no está configurado.");
  const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`;
  const fileRef = ref(storage, `${folder}/${filename}`);
  const snapshot = await uploadBytes(fileRef, file);
  return getDownloadURL(snapshot.ref);
}
