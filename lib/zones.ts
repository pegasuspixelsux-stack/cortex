// Shared zone data used by the homepage Areas section and the property
// detail page's "location context" block.

import type { Zone } from "@/lib/properties";

export interface ZoneInfo {
  name: Zone;
  /** Short atmospheric line used on the homepage zone grid. */
  tagline: string;
  /** Longer editorial paragraph used on property detail pages. */
  profile: string;
  image: string;
  /** Approx. driving distance in km to each airport. */
  distanceLagunaDelSauceKm: number;
  distanceCarrascoKm: number;
}

export const ZONES: ZoneInfo[] = [
  {
    name: "La Barra",
    tagline:
      "Vida social vibrante, playas bravas y una escena gastronómica que no descansa.",
    profile:
      "La Barra combina la energía joven de Punta del Este con una arquitectura contemporánea que crece entre el arroyo y el mar. Sus galerías, restaurantes de autor y playas bravas la convierten en uno de los enclaves más cotizados por inversores que buscan revalorización constante.",
    image:
      "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=1200&q=80&auto=format&fit=crop",
    distanceLagunaDelSauceKm: 20,
    distanceCarrascoKm: 125,
  },
  {
    name: "Manantiales",
    tagline:
      "Arquitectura contemporánea entre médanos y pinares, a pasos del océano.",
    profile:
      "Manantiales es sinónimo de arquitectura de autor: casas de líneas limpias asomadas entre médanos y pinares, a metros de una de las costas más fotografiadas de Uruguay. Su perfil discreto y su cercanía a José Ignacio la posicionan como refugio de diseño para quienes buscan privacidad sin resignar exclusividad.",
    image:
      "https://images.unsplash.com/photo-1494526585095-c41746248156?w=1200&q=80&auto=format&fit=crop",
    distanceLagunaDelSauceKm: 25,
    distanceCarrascoKm: 120,
  },
  {
    name: "José Ignacio",
    tagline:
      "Sofisticación rústica, atardeceres oceánicos y exclusividad absoluta.",
    profile:
      "José Ignacio es el destino más exclusivo de la costa: un pueblo de pescadores reconvertido en referencia mundial de sofisticación discreta. Sus casas de autor, restaurantes reconocidos internacionalmente y atardeceres sobre el faro sostienen una demanda que crece año a año entre inversores y compradores de alto patrimonio.",
    image:
      "https://images.unsplash.com/photo-1493558103817-58b2924bce98?w=1200&q=80&auto=format&fit=crop",
    distanceLagunaDelSauceKm: 40,
    distanceCarrascoKm: 110,
  },
  {
    name: "Playa Brava",
    tagline:
      "Olas imponentes y horizonte infinito frente a la avenida más icónica de Punta del Este.",
    profile:
      "Playa Brava concentra los desarrollos verticales más codiciados de Punta del Este, con vistas directas al oleaje atlántico y acceso inmediato a la vida urbana de la península. Es la elección natural para quienes buscan renta de temporada con ocupación garantizada.",
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80&auto=format&fit=crop",
    distanceLagunaDelSauceKm: 16,
    distanceCarrascoKm: 132,
  },
  {
    name: "Playa Mansa",
    tagline:
      "Aguas calmas, atardeceres de bahía y el pulso urbano a un paso de la costa.",
    profile:
      "Playa Mansa ofrece aguas calmas sobre la bahía de Maldonado y una cercanía inmediata al puerto y la vida gastronómica de la península. Su perfil residencial atrae tanto a familias como a inversores que priorizan liquidez de reventa.",
    image:
      "https://images.unsplash.com/photo-1520942702018-0862200e6873?w=1200&q=80&auto=format&fit=crop",
    distanceLagunaDelSauceKm: 14,
    distanceCarrascoKm: 128,
  },
  {
    name: "Península",
    tagline:
      "El corazón histórico y cosmopolita de Punta del Este, entre el mar y la bahía.",
    profile:
      "La Península es el corazón histórico de Punta del Este: puerto, rambla y los edificios más icónicos de la costa conviven en un radio caminable. Su liquidez y demanda sostenida la convierten en la opción más segura para inversores que priorizan renta y reventa ágil.",
    image:
      "https://images.unsplash.com/photo-1473116763249-2faaef81ccda?w=1200&q=80&auto=format&fit=crop",
    distanceLagunaDelSauceKm: 15,
    distanceCarrascoKm: 130,
  },
];

export function getZoneInfo(zone: Zone): ZoneInfo {
  return ZONES.find((z) => z.name === zone) ?? ZONES[0];
}
