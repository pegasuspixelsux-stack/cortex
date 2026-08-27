// Shared mock property dataset used by the homepage's Featured Properties
// section and the full /propiedades catalog with filters.

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

export interface Property {
  id: number;
  title: string;
  zone: Zone;
  /** Extra locale detail shown alongside the zone, e.g. "Parada 8". */
  locationDetail?: string;
  type: PropertyType;
  transactionType: TransactionType;
  price: number;
  /** Appended after the formatted price, e.g. "/mes" for rentals. */
  priceSuffix?: string;
  beds: number;
  sqm: number;
  amenities: string[];
  image: string;
  /** Shown in the homepage's Featured Properties section. */
  featured?: boolean;
}

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

export const AMENITIES = [
  "Frente al mar",
  "Piscina",
  "Seguridad 24 hs",
  "Vista panorámica",
  "Muelle propio",
] as const;

const priceFormatter = new Intl.NumberFormat("es-UY", {
  maximumFractionDigits: 0,
});

export function formatPrice(property: Pick<Property, "price" | "priceSuffix">) {
  return `USD ${priceFormatter.format(property.price)}${property.priceSuffix ?? ""}`;
}

export function displayZone(property: Pick<Property, "zone" | "locationDetail">) {
  return property.locationDetail
    ? `${property.locationDetail}, ${property.zone}`
    : property.zone;
}

// The same 12 verified Unsplash photos are reused cyclically across the
// extended catalog to keep the mock dataset lightweight.
// Exported so property detail pages can build a secondary photo gallery
// from the same verified pool.
export const IMAGES = [
  "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1200&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1200&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1200&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1200&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=1200&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1200&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&q=80&auto=format&fit=crop",
];

export const PROPERTIES: Property[] = [
  {
    id: 1,
    title: "Residencia Océano",
    zone: "José Ignacio",
    type: "Casa",
    transactionType: "Comprar",
    price: 3200000,
    beds: 5,
    sqm: 620,
    amenities: ["Frente al mar", "Piscina", "Seguridad 24 hs"],
    image: IMAGES[0],
    featured: true,
  },
  {
    id: 2,
    title: "Casa Piedra",
    zone: "Manantiales",
    type: "Casa",
    transactionType: "Comprar",
    price: 2450000,
    beds: 4,
    sqm: 480,
    amenities: ["Piscina", "Vista panorámica"],
    image: IMAGES[1],
    featured: true,
  },
  {
    id: 3,
    title: "Penthouse Brava",
    zone: "Península",
    type: "Penthouse",
    transactionType: "Comprar",
    price: 1890000,
    beds: 3,
    sqm: 210,
    amenities: ["Vista panorámica", "Seguridad 24 hs"],
    image: IMAGES[2],
    featured: true,
  },
  {
    id: 4,
    title: "Villa Horizonte",
    zone: "José Ignacio",
    type: "Casa",
    transactionType: "Comprar",
    price: 4100000,
    beds: 6,
    sqm: 780,
    amenities: ["Frente al mar", "Piscina", "Muelle propio"],
    image: IMAGES[3],
    featured: true,
  },
  {
    id: 5,
    title: "Casa Dune",
    zone: "Manantiales",
    type: "Casa",
    transactionType: "Comprar",
    price: 2750000,
    beds: 4,
    sqm: 510,
    amenities: ["Piscina", "Seguridad 24 hs"],
    image: IMAGES[4],
    featured: true,
  },
  {
    id: 6,
    title: "Residencia Faro",
    zone: "Península",
    type: "Casa",
    transactionType: "Comprar",
    price: 1650000,
    beds: 3,
    sqm: 195,
    amenities: ["Vista panorámica"],
    image: IMAGES[5],
    featured: true,
  },
  {
    id: 7,
    title: "Casa Atlántica",
    zone: "La Barra",
    locationDetail: "Parada 8",
    type: "Casa",
    transactionType: "Comprar",
    price: 2100000,
    beds: 4,
    sqm: 430,
    amenities: ["Frente al mar", "Piscina"],
    image: IMAGES[6],
    featured: true,
  },
  {
    id: 8,
    title: "Villa Serena",
    zone: "José Ignacio",
    type: "Casa",
    transactionType: "Comprar",
    price: 3650000,
    beds: 5,
    sqm: 690,
    amenities: ["Frente al mar", "Piscina", "Seguridad 24 hs"],
    image: IMAGES[7],
    featured: true,
  },
  {
    id: 9,
    title: "Penthouse Marejada",
    zone: "Península",
    type: "Penthouse",
    transactionType: "Comprar",
    price: 2200000,
    beds: 3,
    sqm: 230,
    amenities: ["Vista panorámica", "Seguridad 24 hs"],
    image: IMAGES[8],
    featured: true,
  },
  {
    id: 10,
    title: "Casa Bosque",
    zone: "Manantiales",
    type: "Casa",
    transactionType: "Comprar",
    price: 2980000,
    beds: 5,
    sqm: 560,
    amenities: ["Piscina", "Seguridad 24 hs"],
    image: IMAGES[9],
    featured: true,
  },
  {
    id: 11,
    title: "Residencia Cielo",
    zone: "La Barra",
    locationDetail: "Parada 12",
    type: "Casa",
    transactionType: "Comprar",
    price: 1980000,
    beds: 4,
    sqm: 400,
    amenities: ["Frente al mar"],
    image: IMAGES[10],
    featured: true,
  },
  {
    id: 12,
    title: "Villa Mirador",
    zone: "José Ignacio",
    type: "Casa",
    transactionType: "Comprar",
    price: 3900000,
    beds: 5,
    sqm: 640,
    amenities: ["Frente al mar", "Piscina", "Seguridad 24 hs"],
    image: IMAGES[11],
    featured: true,
  },
  {
    id: 13,
    title: "Terreno Vista Mar",
    zone: "Playa Brava",
    type: "Terreno",
    transactionType: "Comprar",
    price: 980000,
    beds: 0,
    sqm: 1500,
    amenities: ["Frente al mar", "Vista panorámica"],
    image: IMAGES[0],
  },
  {
    id: 14,
    title: "Apartamento Marina",
    zone: "Playa Mansa",
    type: "Apartamento",
    transactionType: "Alquiler anual",
    price: 3800,
    priceSuffix: "/mes",
    beds: 2,
    sqm: 95,
    amenities: ["Piscina", "Seguridad 24 hs"],
    image: IMAGES[1],
  },
  {
    id: 15,
    title: "Penthouse Brisas",
    zone: "Playa Mansa",
    type: "Penthouse",
    transactionType: "Comprar",
    price: 2350000,
    beds: 3,
    sqm: 240,
    amenities: ["Piscina", "Vista panorámica", "Seguridad 24 hs"],
    image: IMAGES[2],
  },
  {
    id: 16,
    title: "Casa Médano",
    zone: "Playa Brava",
    type: "Casa",
    transactionType: "Alquiler de temporada",
    price: 28000,
    priceSuffix: "/temporada",
    beds: 5,
    sqm: 420,
    amenities: ["Frente al mar", "Piscina"],
    image: IMAGES[3],
  },
  {
    id: 17,
    title: "Apartamento Rambla",
    zone: "Península",
    type: "Apartamento",
    transactionType: "Comprar",
    price: 620000,
    beds: 2,
    sqm: 85,
    amenities: ["Vista panorámica", "Seguridad 24 hs"],
    image: IMAGES[4],
  },
  {
    id: 18,
    title: "Terreno Bosque",
    zone: "Manantiales",
    type: "Terreno",
    transactionType: "Comprar",
    price: 750000,
    beds: 0,
    sqm: 2000,
    amenities: ["Vista panorámica"],
    image: IMAGES[5],
  },
  {
    id: 19,
    title: "Penthouse Sur",
    zone: "Península",
    type: "Penthouse",
    transactionType: "Alquiler de temporada",
    price: 32000,
    priceSuffix: "/temporada",
    beds: 4,
    sqm: 260,
    amenities: ["Frente al mar", "Piscina", "Seguridad 24 hs"],
    image: IMAGES[6],
  },
  {
    id: 20,
    title: "Casa Pinar",
    zone: "José Ignacio",
    type: "Casa",
    transactionType: "Alquiler anual",
    price: 5200,
    priceSuffix: "/mes",
    beds: 4,
    sqm: 380,
    amenities: ["Piscina", "Muelle propio"],
    image: IMAGES[7],
  },
  {
    id: 21,
    title: "Apartamento Vista Brava",
    zone: "Playa Brava",
    type: "Apartamento",
    transactionType: "Comprar",
    price: 540000,
    beds: 1,
    sqm: 60,
    amenities: ["Frente al mar"],
    image: IMAGES[8],
  },
  {
    id: 22,
    title: "Terreno Reserva",
    zone: "José Ignacio",
    type: "Terreno",
    transactionType: "Comprar",
    price: 1650000,
    beds: 0,
    sqm: 5000,
    amenities: ["Frente al mar", "Vista panorámica"],
    image: IMAGES[9],
  },
  {
    id: 23,
    title: "Penthouse Bahía",
    zone: "Playa Mansa",
    type: "Penthouse",
    transactionType: "Comprar",
    price: 1980000,
    beds: 3,
    sqm: 215,
    amenities: ["Piscina", "Seguridad 24 hs", "Vista panorámica"],
    image: IMAGES[10],
  },
  {
    id: 24,
    title: "Casa Retiro",
    zone: "Manantiales",
    type: "Casa",
    transactionType: "Alquiler de temporada",
    price: 22000,
    priceSuffix: "/temporada",
    beds: 3,
    sqm: 310,
    amenities: ["Piscina", "Seguridad 24 hs"],
    image: IMAGES[11],
  },
];

export function getPropertyById(id: number): Property | undefined {
  return PROPERTIES.find((property) => property.id === id);
}

/** Main photo + 3 secondary photos drawn from the shared image pool. */
export function getPropertyGallery(property: Property): string[] {
  const secondary = IMAGES.filter((image) => image !== property.image).slice(
    property.id % (IMAGES.length - 3),
    property.id % (IMAGES.length - 3) + 3,
  );
  return [property.image, ...secondary];
}

/** Covered area vs. lot size — Terreno listings only have raw land. */
export function getPropertySpecs(property: Property) {
  if (property.type === "Terreno") {
    return { coveredSqm: undefined, lotSqm: property.sqm };
  }
  return { coveredSqm: property.sqm, lotSqm: Math.round(property.sqm * 1.6) };
}

/** Estimated bathroom count — not stored per listing, derived from beds. */
export function getPropertyBaths(property: Property): number {
  if (property.beds === 0) return 0;
  return Math.max(1, Math.round(property.beds * 0.75));
}
