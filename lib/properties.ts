// Shared taxonomy for the property catalog — the zones, property types and
// transaction types the public filters and the admin form share. The
// listings themselves live in Firestore (see lib/admin/properties.ts and
// lib/publicProperties.ts); there is no mock dataset any more.

export type Zone =
  | "La Barra"
  | "Manantiales"
  | "José Ignacio"
  | "Playa Brava"
  | "Playa Mansa"
  | "Península";

export type PropertyType = "Casa" | "Penthouse" | "Terreno" | "Apartamento";

export type TransactionType =
  | "Comprar"
  | "Alquiler anual"
  | "Alquiler de temporada";

export const ZONES: Zone[] = [
  "La Barra",
  "Manantiales",
  "José Ignacio",
  "Playa Brava",
  "Playa Mansa",
  "Península",
];

export const PROPERTY_TYPES: PropertyType[] = [
  "Casa",
  "Penthouse",
  "Terreno",
  "Apartamento",
];

export const TRANSACTION_TYPES: TransactionType[] = [
  "Comprar",
  "Alquiler anual",
  "Alquiler de temporada",
];

const priceFormatter = new Intl.NumberFormat("es-UY", {
  maximumFractionDigits: 0,
});

/** "USD 3.200.000" */
export function formatUsd(price: number): string {
  return `USD ${priceFormatter.format(price || 0)}`;
}
