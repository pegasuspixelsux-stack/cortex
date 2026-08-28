// Curated marketing content for the investor-facing "Desarrollos" views.
// This is editorial seed data (not the Firestore property catalog): the
// developments shown here are illustrative pipeline projects.

export interface Development {
  name: string;
  location: string;
  /** The kind of investment opportunity, e.g. "Torre en pozo". */
  opportunityType: string;
  image: string;
  /** Estimated price range for units / lots. */
  priceRange: string;
  /** Distinctive stage badge, e.g. "En Inicio / Preventa". */
  stageTag?: string;
  /** Optional secondary metric shown under the price. */
  metricLabel?: string;
  metricValue?: string;
}

/** The three "casos modelo" already shown on /inversiones. */
export const MODEL_DEVELOPMENTS: Development[] = [
  {
    name: "Torre Marena",
    location: "Península, Punta del Este",
    opportunityType: "Edificio residencial en pozo",
    priceRange: "USD 320.000 – 1.200.000",
    metricLabel: "Retorno proyectado",
    metricValue: "+22% en pozo",
    image:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1000&q=80&auto=format&fit=crop",
  },
  {
    name: "Chacras del Este",
    location: "José Ignacio, Maldonado",
    opportunityType: "Fraccionamiento / chacras",
    priceRange: "USD 180.000 – 640.000",
    metricLabel: "Plusvalía estimada",
    metricValue: "+15% anual",
    image:
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1000&q=80&auto=format&fit=crop",
  },
  {
    name: "Residencial Brava",
    location: "Playa Brava, Punta del Este",
    opportunityType: "Edificio boutique de apartamentos",
    priceRange: "USD 260.000 – 900.000",
    metricLabel: "Renta anual estimada",
    metricValue: "6–8% en USD",
    image:
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1000&q=80&auto=format&fit=crop",
  },
];

/** Six launch-stage developments for the dedicated /desarrollos page. */
export const INVESTOR_DEVELOPMENTS: Development[] = [
  {
    name: "Sausalito Pozo",
    location: "La Barra, Maldonado",
    opportunityType: "Torre residencial en pozo",
    priceRange: "USD 190.000 – 720.000",
    stageTag: "En Inicio / Preventa",
    metricLabel: "Entrega estimada",
    metricValue: "36 meses",
    image:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1000&q=80&auto=format&fit=crop",
  },
  {
    name: "Distrito Manantiales",
    location: "Manantiales, Punta del Este",
    opportunityType: "Complejo boutique en preventa",
    priceRange: "USD 240.000 – 890.000",
    stageTag: "En Inicio / Preventa",
    metricLabel: "Unidades",
    metricValue: "28 en primera fase",
    image:
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1000&q=80&auto=format&fit=crop",
  },
  {
    name: "Faro Norte Living",
    location: "José Ignacio, Maldonado",
    opportunityType: "Condominios en pozo",
    priceRange: "USD 320.000 – 1.400.000",
    stageTag: "En Inicio / Preventa",
    metricLabel: "Anticipo",
    metricValue: "desde 20%",
    image:
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1000&q=80&auto=format&fit=crop",
  },
  {
    name: "Rambla Brava 900",
    location: "Playa Brava, Punta del Este",
    opportunityType: "Edificio frente al mar en pozo",
    priceRange: "USD 450.000 – 2.100.000",
    stageTag: "En Inicio / Preventa",
    metricLabel: "Plusvalía proyectada",
    metricValue: "+25% a entrega",
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1000&q=80&auto=format&fit=crop",
  },
  {
    name: "Chacra Eólica",
    location: "Ruta 104, José Ignacio",
    opportunityType: "Fraccionamiento en lanzamiento",
    priceRange: "USD 160.000 – 480.000",
    stageTag: "En Inicio / Preventa",
    metricLabel: "Lotes",
    metricValue: "40 en preventa",
    image:
      "https://images.unsplash.com/photo-1449844908441-8829872d2607?w=1000&q=80&auto=format&fit=crop",
  },
  {
    name: "Península Vertical",
    location: "Península, Punta del Este",
    opportunityType: "Torre de usos mixtos en preventa",
    priceRange: "USD 280.000 – 1.100.000",
    stageTag: "En Inicio / Preventa",
    metricLabel: "Renta estimada",
    metricValue: "5–7% en USD",
    image:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1000&q=80&auto=format&fit=crop",
  },
];
