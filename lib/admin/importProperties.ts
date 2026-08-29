// Batched insertion of validated rows into the Firestore `properties`
// collection. Runs client-side in the authed admin's session (there is no
// Admin SDK), so no serverless timeout — just chunked writeBatch commits.

import {
  collection,
  doc,
  writeBatch,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { AdminPropertyInput } from "@/lib/admin/properties";

const COLLECTION = "properties";
/** Firestore hard limit is 500 ops/batch; leave headroom. */
const BATCH_SIZE = 450;

export interface ImportOutcome {
  succeeded: number;
  /** 0-based index into the input array + the reason it failed. */
  failed: { index: number; error: string }[];
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export async function importProperties(
  rows: AdminPropertyInput[],
  onProgress?: (done: number, total: number) => void,
): Promise<ImportOutcome> {
  if (!db) throw new Error("Firebase no está configurado.");
  const database = db;
  const outcome: ImportOutcome = { succeeded: 0, failed: [] };
  const groups = chunk(rows, BATCH_SIZE);
  let done = 0;

  for (let g = 0; g < groups.length; g++) {
    const group = groups[g];
    const offset = g * BATCH_SIZE;
    const batch = writeBatch(database);
    for (const row of group) {
      const ref = doc(collection(database, COLLECTION));
      batch.set(ref, { ...row, createdAt: serverTimestamp() });
    }

    try {
      await batch.commit();
      outcome.succeeded += group.length;
    } catch {
      // The batch is atomic — one bad row fails all of it. Retry the group
      // one row at a time to isolate which rows are the problem.
      for (let i = 0; i < group.length; i++) {
        try {
          await addDoc(collection(database, COLLECTION), {
            ...group[i],
            createdAt: serverTimestamp(),
          });
          outcome.succeeded += 1;
        } catch (err) {
          outcome.failed.push({
            index: offset + i,
            error: err instanceof Error ? err.message : "Error desconocido",
          });
        }
      }
    }

    done += group.length;
    onProgress?.(done, rows.length);
  }

  return outcome;
}
