// One-shot: push the mock catalog (lib/properties.ts) into Firestore so the
// admin, the reel generator, and eventually the public site all read real
// data. Runs client-side as the signed-in admin, so it satisfies the
// properties write rule.

import { PROPERTIES } from "@/lib/properties";
import {
  createProperty,
  listProperties,
  type AdminPropertyInput,
  type RentalTerm,
} from "@/lib/admin/properties";

function operationOf(t: (typeof PROPERTIES)[number]["transactionType"]): {
  operation: AdminPropertyInput["operation"];
  rentalTerms: RentalTerm[];
} {
  if (t === "Comprar") return { operation: "Venta", rentalTerms: [] };
  if (t === "Alquiler anual")
    return { operation: "Alquiler", rentalTerms: ["Alquiler Anual"] };
  return {
    operation: "Alquiler",
    rentalTerms: [
      "1era Quincena de Enero",
      "2da Quincena de Enero",
      "1era Quincena de Febrero",
    ],
  };
}

function describe(p: (typeof PROPERTIES)[number]): string {
  const where = p.locationDetail ? `${p.locationDetail}, ${p.zone}` : p.zone;
  const size =
    p.type === "Terreno"
      ? `${p.sqm.toLocaleString("es-UY")} m² de terreno`
      : `${p.sqm} m² cubiertos${p.beds ? ` y ${p.beds} dormitorios` : ""}`;
  return `${p.title} — ${p.type.toLowerCase()} en ${where}. ${size}. ${p.amenities.join(
    " · ",
  )}.`;
}

export async function seedSampleProperties(): Promise<{
  created: number;
  skipped: boolean;
}> {
  const existing = await listProperties(1);
  if (existing.length > 0) return { created: 0, skipped: true };

  let created = 0;
  for (const p of PROPERTIES) {
    const input: AdminPropertyInput = {
      title: p.title,
      description: describe(p),
      price: p.price,
      zone: p.zone,
      type: p.type,
      ...operationOf(p.transactionType),
      sqm: p.sqm,
      beds: p.beds,
      images: [p.image],
      status: "Publicada",
    };
    await createProperty(input);
    created += 1;
  }
  return { created, skipped: false };
}
