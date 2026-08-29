// Pure CSV → AdminPropertyInput validation for the bulk property importer.
// No Firestore / React here so it stays unit-testable and could later back
// an Admin-SDK route unchanged.

import {
  OPERATION_TYPES,
  RENTAL_TERMS,
  type AdminPropertyInput,
  type OperationType,
  type RentalTerm,
} from "@/lib/admin/properties";
import { ZONES, PROPERTY_TYPES } from "@/lib/properties";

export type CanonicalColumn =
  | "title"
  | "description"
  | "price"
  | "zone"
  | "type"
  | "operation"
  | "rentalTerms"
  | "sqm"
  | "beds"
  | "baths"
  | "images"
  | "agentName"
  | "featured"
  | "status";

export const REQUIRED_COLUMNS: CanonicalColumn[] = [
  "title",
  "description",
  "price",
  "zone",
  "type",
  "operation",
  "sqm",
  "beds",
];

/** Canonical header + accepted aliases (compared lowercased + trimmed). */
const COLUMN_ALIASES: Record<CanonicalColumn, string[]> = {
  title: ["title", "titulo", "título", "nombre"],
  description: ["description", "descripcion", "descripción", "detalle"],
  price: ["price", "precio", "valor", "usd", "monto"],
  zone: ["zone", "zona", "ubicacion", "ubicación", "barrio"],
  type: ["type", "tipo", "tipologia", "tipología", "property_type", "propertytype"],
  operation: [
    "operation",
    "operacion",
    "operación",
    "transaccion",
    "transacción",
    "listing_type",
    "listingtype",
  ],
  rentalTerms: [
    "rentalterms",
    "terminos",
    "términos",
    "periodos",
    "períodos",
    "terminos de alquiler",
  ],
  sqm: [
    "sqm",
    "m2",
    "metros",
    "superficie",
    "metros cuadrados",
    "m²",
    "area_sqm",
    "areasqm",
    "area",
    "área",
  ],
  beds: ["beds", "dormitorios", "habitaciones", "cuartos", "dorms", "bedrooms"],
  baths: ["baths", "banos", "baños", "bathrooms"],
  images: ["images", "imagenes", "imágenes", "fotos", "urls", "fotografias"],
  agentName: ["agentname", "agente", "asesor", "agent"],
  featured: ["featured", "destacado", "destacada", "portada"],
  status: ["status", "estado"],
};

const norm = (s: string) => s.trim().toLowerCase();

export interface HeaderResolution {
  /** original header text → canonical column */
  map: Map<string, CanonicalColumn>;
  unknown: string[];
  missingRequired: CanonicalColumn[];
}

export function resolveHeaders(headers: string[]): HeaderResolution {
  const map = new Map<string, CanonicalColumn>();
  const unknown: string[] = [];

  for (const raw of headers) {
    const n = norm(raw);
    const hit = (Object.keys(COLUMN_ALIASES) as CanonicalColumn[]).find((col) =>
      COLUMN_ALIASES[col].includes(n),
    );
    if (hit) map.set(raw, hit);
    else if (raw.trim()) unknown.push(raw);
  }

  const present = new Set(map.values());
  const missingRequired = REQUIRED_COLUMNS.filter((c) => !present.has(c));
  return { map, unknown, missingRequired };
}

/** Row keyed by canonical column, values as raw strings. */
export function normalizeRow(
  raw: Record<string, unknown>,
  resolution: HeaderResolution,
): Record<CanonicalColumn, string> {
  const out = {} as Record<CanonicalColumn, string>;
  for (const [header, col] of resolution.map) {
    const v = raw[header];
    out[col] = v == null ? "" : String(v).trim();
  }
  return out;
}

export interface FieldError {
  field: CanonicalColumn | "row";
  message: string;
}

export type RowResult =
  | { ok: true; line: number; value: AdminPropertyInput }
  | { ok: false; line: number; errors: FieldError[] };

/* ---- value parsers --------------------------------------------------- */

/** Tolerates "$", "USD", "1.234.567,89", "1,234,567.89", "1.234.567". */
export function parseNumber(raw: string): number | null {
  const s = raw.replace(/[^\d.,-]/g, "");
  if (!s || !/\d/.test(s)) return null;

  const commas = (s.match(/,/g) ?? []).length;
  const dots = (s.match(/\./g) ?? []).length;
  const lastComma = s.lastIndexOf(",");
  const lastDot = s.lastIndexOf(".");

  let normalized: string;
  if (commas && dots) {
    // Whichever comes last is the decimal separator.
    normalized =
      lastComma > lastDot
        ? s.replace(/\./g, "").replace(",", ".")
        : s.replace(/,/g, "");
  } else if (commas > 1) {
    normalized = s.replace(/,/g, ""); // 1,234,567 → thousands
  } else if (dots > 1) {
    normalized = s.replace(/\./g, ""); // 1.234.567 → thousands
  } else if (commas === 1) {
    const after = s.length - lastComma - 1;
    normalized =
      after === 3 && lastComma > 0
        ? s.replace(",", "") // 1,234 → 1234
        : s.replace(",", "."); // 1,5 → 1.5
  } else {
    normalized = s; // single or no dot — JS handles it
  }

  const n = Number(normalized);
  return Number.isFinite(n) ? n : null;
}

/** Common English / lowercase spellings → the canonical enum value. */
const OPERATION_SYNONYMS: Record<string, OperationType> = {
  venta: "Venta",
  sale: "Venta",
  "for sale": "Venta",
  compra: "Venta",
  alquiler: "Alquiler",
  rent: "Alquiler",
  rental: "Alquiler",
  "for rent": "Alquiler",
  renta: "Alquiler",
};

const TYPE_SYNONYMS: Record<string, string> = {
  casa: "Casa",
  house: "Casa",
  home: "Casa",
  penthouse: "Penthouse",
  ph: "Penthouse",
  terreno: "Terreno",
  land: "Terreno",
  plot: "Terreno",
  lote: "Terreno",
  apartamento: "Apartamento",
  apartment: "Apartamento",
  apto: "Apartamento",
  depto: "Apartamento",
  flat: "Apartamento",
};

const STATUS_SYNONYMS: Record<string, "Publicada" | "Borrador"> = {
  publicada: "Publicada",
  published: "Publicada",
  available: "Publicada",
  activa: "Publicada",
  active: "Publicada",
  borrador: "Borrador",
  draft: "Borrador",
  hidden: "Borrador",
  oculta: "Borrador",
};

const TRUE_WORDS = new Set(["true", "1", "si", "sí", "yes", "x", "verdadero"]);
const FALSE_WORDS = new Set(["false", "0", "no", "", "falso"]);

export function parseBool(raw: string): boolean | null {
  const n = norm(raw);
  if (TRUE_WORDS.has(n)) return true;
  if (FALSE_WORDS.has(n)) return false;
  return null;
}

function splitList(raw: string): string[] {
  return raw
    .split(/[;\n|]/)
    .map((x) => x.trim())
    .filter(Boolean);
}

/* ---- row validation ------------------------------------------------- */

export function validateRow(
  row: Partial<Record<CanonicalColumn, string>>,
  line: number,
): RowResult {
  const errors: FieldError[] = [];
  const get = (c: CanonicalColumn) => (row[c] ?? "").trim();

  const title = get("title");
  if (!title) errors.push({ field: "title", message: "Título requerido" });

  const description = get("description");
  if (!description)
    errors.push({ field: "description", message: "Descripción requerida" });

  const price = parseNumber(get("price"));
  if (get("price") === "") {
    errors.push({ field: "price", message: "Precio requerido" });
  } else if (price === null) {
    errors.push({
      field: "price",
      message: `Precio inválido: "${get("price")}"`,
    });
  } else if (price <= 0) {
    errors.push({ field: "price", message: "El precio debe ser mayor a 0" });
  }

  const zone = get("zone");
  if (!zone) errors.push({ field: "zone", message: "Zona requerida" });
  else if (!(ZONES as string[]).includes(zone))
    errors.push({
      field: "zone",
      message: `Zona inválida: "${zone}". Válidas: ${ZONES.join(", ")}`,
    });

  const typeRaw = get("type");
  const type = TYPE_SYNONYMS[norm(typeRaw)] ?? typeRaw;
  if (!typeRaw) errors.push({ field: "type", message: "Tipo requerido" });
  else if (!(PROPERTY_TYPES as string[]).includes(type))
    errors.push({
      field: "type",
      message: `Tipo inválido: "${typeRaw}". Válidos: ${PROPERTY_TYPES.join(", ")}`,
    });

  const operationRaw = get("operation");
  const operationResolved =
    OPERATION_SYNONYMS[norm(operationRaw)] ??
    ((OPERATION_TYPES as string[]).includes(operationRaw)
      ? (operationRaw as OperationType)
      : null);
  let operation: OperationType = "Venta";
  if (!operationRaw)
    errors.push({ field: "operation", message: "Operación requerida" });
  else if (!operationResolved)
    errors.push({
      field: "operation",
      message: `Operación inválida: "${operationRaw}". Válidas: ${OPERATION_TYPES.join(", ")} (o sale/rent)`,
    });
  else operation = operationResolved;

  const sqm = parseNumber(get("sqm"));
  if (get("sqm") === "")
    errors.push({ field: "sqm", message: "Superficie (m²) requerida" });
  else if (sqm === null || sqm < 0)
    errors.push({
      field: "sqm",
      message: `Superficie inválida: "${get("sqm")}"`,
    });

  const beds = parseNumber(get("beds"));
  if (get("beds") === "")
    errors.push({ field: "beds", message: "Dormitorios requerido (0 si no aplica)" });
  else if (beds === null || beds < 0 || !Number.isInteger(beds))
    errors.push({
      field: "beds",
      message: `Dormitorios inválido: "${get("beds")}"`,
    });

  let baths: number | undefined;
  if (get("baths") !== "") {
    const b = parseNumber(get("baths"));
    if (b === null || b < 0 || !Number.isInteger(b))
      errors.push({ field: "baths", message: `Baños inválido: "${get("baths")}"` });
    else baths = b;
  }

  let rentalTerms: RentalTerm[] = [];
  if (operation === "Alquiler" && get("rentalTerms")) {
    const terms = splitList(get("rentalTerms"));
    const bad = terms.filter((t) => !(RENTAL_TERMS as string[]).includes(t));
    if (bad.length)
      errors.push({
        field: "rentalTerms",
        message: `Término(s) inválido(s): ${bad.join(", ")}`,
      });
    rentalTerms = terms.filter((t) =>
      (RENTAL_TERMS as string[]).includes(t),
    ) as RentalTerm[];
  }

  let images: string[] = [];
  if (get("images")) {
    images = splitList(get("images"));
    const notUrl = images.filter((u) => !/^https?:\/\//i.test(u));
    if (notUrl.length)
      errors.push({
        field: "images",
        message: `URL(s) inválida(s): ${notUrl.slice(0, 2).join(", ")}${notUrl.length > 2 ? "…" : ""}`,
      });
    if (images.length > 12)
      errors.push({
        field: "images",
        message: `Máximo 12 imágenes (hay ${images.length})`,
      });
  }

  let featured: boolean | undefined;
  if (get("featured") !== "") {
    const f = parseBool(get("featured"));
    if (f === null)
      errors.push({
        field: "featured",
        message: `Destacado inválido: "${get("featured")}" (usá sí/no)`,
      });
    else featured = f;
  }

  const statusRaw = get("status");
  let status: AdminPropertyInput["status"] = "Publicada";
  if (statusRaw) {
    const resolved =
      STATUS_SYNONYMS[norm(statusRaw)] ??
      (statusRaw === "Publicada" || statusRaw === "Borrador" ? statusRaw : null);
    if (!resolved)
      errors.push({
        field: "status",
        message: `Estado inválido: "${statusRaw}" (Publicada | Borrador)`,
      });
    else status = resolved;
  }

  if (errors.length) return { ok: false, line, errors };

  const value: AdminPropertyInput = {
    title,
    description,
    price: price as number,
    zone,
    type,
    operation,
    rentalTerms,
    sqm: sqm as number,
    beds: beds as number,
    images,
    status,
    ...(baths !== undefined ? { baths } : {}),
    ...(get("agentName") ? { agentName: get("agentName") } : {}),
    ...(featured !== undefined ? { featured } : {}),
  };
  return { ok: true, line, value };
}

/* ---- template ----------------------------------------------------- */

export const CSV_TEMPLATE_HEADERS: CanonicalColumn[] = [
  "title",
  "description",
  "price",
  "zone",
  "type",
  "operation",
  "rentalTerms",
  "sqm",
  "beds",
  "baths",
  "images",
  "agentName",
  "featured",
  "status",
];

export function csvTemplate(): string {
  const example1 = [
    "Residencia Océano",
    "Casa de autor frente al mar con piscina infinita.",
    "3200000",
    "José Ignacio",
    "Casa",
    "Venta",
    "",
    "420",
    "4",
    "3",
    "https://ejemplo.com/foto1.jpg;https://ejemplo.com/foto2.jpg",
    "Sofía Bianchi",
    "si",
    "Publicada",
  ];
  const example2 = [
    "Penthouse Brava",
    "Penthouse con vista panorámica, alquiler de temporada.",
    "18000",
    "Playa Brava",
    "Penthouse",
    "Alquiler",
    "1era Quincena de Enero;2da Quincena de Enero",
    "180",
    "3",
    "2",
    "",
    "",
    "no",
    "Borrador",
  ];
  const esc = (v: string) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
  return [CSV_TEMPLATE_HEADERS, example1, example2]
    .map((r) => r.map(esc).join(","))
    .join("\r\n");
}
