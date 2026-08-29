import { describe, it, expect } from "vitest";
import {
  resolveHeaders,
  validateRow,
  parseNumber,
  parseBool,
  REQUIRED_COLUMNS,
  type CanonicalColumn,
} from "./propertyImport";

const row = (over: Partial<Record<CanonicalColumn, string>> = {}) => ({
  title: "Casa Test",
  description: "Una casa.",
  price: "500000",
  zone: "José Ignacio",
  type: "Casa",
  operation: "Venta",
  sqm: "300",
  beds: "3",
  ...over,
});

describe("parseNumber", () => {
  it("strips currency and thousands separators (es + en)", () => {
    expect(parseNumber("USD 1.234.567")).toBe(1234567);
    expect(parseNumber("$1,234,567.50")).toBe(1234567.5);
    expect(parseNumber("3.200.000,99")).toBe(3200000.99);
    expect(parseNumber("450")).toBe(450);
  });
  it("returns null for junk", () => {
    expect(parseNumber("")).toBeNull();
    expect(parseNumber("abc")).toBeNull();
  });
});

describe("parseBool", () => {
  it("accepts common truthy/falsy words", () => {
    expect(parseBool("sí")).toBe(true);
    expect(parseBool("1")).toBe(true);
    expect(parseBool("no")).toBe(false);
    expect(parseBool("")).toBe(false);
    expect(parseBool("maybe")).toBeNull();
  });
});

describe("resolveHeaders", () => {
  it("maps aliases case-insensitively and flags unknown + missing", () => {
    const r = resolveHeaders([
      "Título",
      "descripcion",
      "Precio",
      "zona",
      "Tipo",
      "operación",
      "m2",
      "Dormitorios",
      "colorFavorito",
    ]);
    expect(r.map.get("Título")).toBe("title");
    expect(r.map.get("m2")).toBe("sqm");
    expect(r.unknown).toEqual(["colorFavorito"]);
    expect(r.missingRequired).toEqual([]);
  });

  it("reports every missing required column", () => {
    const r = resolveHeaders(["title", "price"]);
    expect(r.missingRequired.sort()).toEqual(
      REQUIRED_COLUMNS.filter((c) => c !== "title" && c !== "price").sort(),
    );
  });
});

describe("validateRow", () => {
  it("accepts a well-formed row and normalizes types", () => {
    const res = validateRow(row({ baths: "2", images: "https://x.com/a.jpg" }), 2);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.value.price).toBe(500000);
      expect(res.value.beds).toBe(3);
      expect(res.value.baths).toBe(2);
      expect(res.value.images).toEqual(["https://x.com/a.jpg"]);
      expect(res.value.status).toBe("Publicada");
      expect(res.value.rentalTerms).toEqual([]);
    }
  });

  it("collects every error on the row with the line number", () => {
    const res = validateRow(
      { title: "", price: "abc", zone: "Marte", type: "Iglú", operation: "Regalo", sqm: "", beds: "-1", description: "x" },
      7,
    );
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.line).toBe(7);
      const fields = res.errors.map((e) => e.field);
      expect(fields).toEqual(
        expect.arrayContaining(["title", "price", "zone", "type", "operation", "sqm", "beds"]),
      );
    }
  });

  it("rejects >12 images and non-URL entries", () => {
    const many = Array.from({ length: 13 }, (_, i) => `https://x.com/${i}.jpg`).join(";");
    const res = validateRow(row({ images: many }), 3);
    expect(res.ok).toBe(false);
    const res2 = validateRow(row({ images: "not-a-url" }), 3);
    expect(res2.ok).toBe(false);
  });

  it("maps English/lowercase enum values to the canonical ones", () => {
    const res = validateRow(
      row({ type: "apartment", operation: "sale", status: "available" }),
      2,
    );
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.value.type).toBe("Apartamento");
      expect(res.value.operation).toBe("Venta");
      expect(res.value.status).toBe("Publicada");
    }
  });

  it("rejects a type Cortex does not have (e.g. commercial)", () => {
    const res = validateRow(row({ type: "commercial" }), 2);
    expect(res.ok).toBe(false);
  });

  it("only keeps rentalTerms for Alquiler and validates them", () => {
    const ok = validateRow(
      row({ operation: "Alquiler", rentalTerms: "Por Mes;Alquiler Anual" }),
      4,
    );
    expect(ok.ok).toBe(true);
    if (ok.ok) expect(ok.value.rentalTerms).toEqual(["Por Mes", "Alquiler Anual"]);

    const bad = validateRow(
      row({ operation: "Alquiler", rentalTerms: "Cada Bisiesto" }),
      5,
    );
    expect(bad.ok).toBe(false);

    const ventaIgnoresTerms = validateRow(
      row({ operation: "Venta", rentalTerms: "Por Mes" }),
      6,
    );
    expect(ventaIgnoresTerms.ok).toBe(true);
    if (ventaIgnoresTerms.ok)
      expect(ventaIgnoresTerms.value.rentalTerms).toEqual([]);
  });
});
