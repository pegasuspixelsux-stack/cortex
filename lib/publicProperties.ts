// Public read layer for the Firestore `properties` collection. The public
// marketing site (homepage, /propiedades, detail pages) reads through
// here; writes stay in lib/admin/properties.ts. Firestore rules make the
// collection world-readable.

import {
  listProperties as listAll,
  getProperty,
  type AdminProperty,
} from "@/lib/admin/properties";
import { formatUsd } from "@/lib/properties";

export type PublicProperty = AdminProperty;
export { getProperty };

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1200&q=80&auto=format&fit=crop";

/** Published properties only, newest first. */
export async function listPublicProperties(): Promise<PublicProperty[]> {
  const all = await listAll();
  return all.filter((p) => p.status !== "Borrador");
}

export function coverImage(p: Pick<PublicProperty, "images">): string {
  return p.images?.find((u) => typeof u === "string" && u.length > 0) ?? FALLBACK_IMAGE;
}

/** Real photos, or a single fallback so galleries never render empty. */
export function galleryImages(p: Pick<PublicProperty, "images">): string[] {
  const imgs = (p.images ?? []).filter((u) => typeof u === "string" && u.length > 0);
  return imgs.length ? imgs : [FALLBACK_IMAGE];
}

/** Price with a rental cadence suffix where it applies. */
export function priceLabel(
  p: Pick<PublicProperty, "price" | "operation" | "rentalTerms">,
): string {
  const base = formatUsd(p.price);
  if (p.operation !== "Alquiler") return base;
  const terms = p.rentalTerms ?? [];
  if (terms.includes("Por Mes")) return `${base} /mes`;
  if (terms.includes("Alquiler Anual")) return `${base} /año`;
  return base;
}

/** Human label for the operation, e.g. "Venta" or "Alquiler de temporada". */
export function operationLabel(
  p: Pick<PublicProperty, "operation" | "rentalTerms">,
): string {
  if (p.operation !== "Alquiler") return "Venta";
  const terms = p.rentalTerms ?? [];
  if (terms.includes("Alquiler Anual")) return "Alquiler anual";
  if (terms.length) return "Alquiler de temporada";
  return "Alquiler";
}
