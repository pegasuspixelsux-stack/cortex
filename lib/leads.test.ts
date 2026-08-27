import { describe, it, expect } from "vitest";
import {
  scoreLead,
  isPlausiblePhone,
  EMPTY_DRAFT,
  type LeadDraft,
} from "./leads";

const draft = (over: Partial<LeadDraft> = {}): LeadDraft => ({
  ...EMPTY_DRAFT,
  ...over,
});

describe("isPlausiblePhone", () => {
  it("accepts 8–15 digit numbers, with or without punctuation", () => {
    expect(isPlausiblePhone("+598 99 123 456")).toBe(true);
    expect(isPlausiblePhone("099123456")).toBe(true);
  });

  it("rejects too-short or empty input", () => {
    expect(isPlausiblePhone("")).toBe(false);
    expect(isPlausiblePhone("12345")).toBe(false);
  });

  it("rejects absurdly long input", () => {
    expect(isPlausiblePhone("1234567890123456")).toBe(false);
  });
});

describe("scoreLead", () => {
  it("floors an empty draft at 1", () => {
    expect(scoreLead(EMPTY_DRAFT).score).toBe(1);
  });

  it("caps a maxed-out luxury lead at 10", () => {
    const { score } = scoreLead(
      draft({
        transactionType: "Comprar",
        zones: ["José Ignacio"],
        propertyType: "Casa de autor",
        budget: "Más de $3M",
        timeframe: "Inmediato / Menos de 3 meses",
        name: "A",
        email: "a@b.com",
        phone: "+59899123456",
        contactPreference: "WhatsApp",
        contactWindow: "Inmediato",
      }),
    );
    expect(score).toBe(10);
  });

  it("ranks a near-term high-budget buyer above an exploratory low-budget one", () => {
    const hot = scoreLead(
      draft({
        transactionType: "Comprar",
        budget: "$1.5M – $3M",
        timeframe: "Inmediato / Menos de 3 meses",
        zones: ["Manantiales"],
        propertyType: "Penthouse",
      }),
    ).score;
    const cold = scoreLead(
      draft({
        transactionType: "Alquiler de temporada",
        budget: "Menos de $500k",
        timeframe: "Exploratorio / Más de 6 meses",
        zones: ["La Barra", "Manantiales", "José Ignacio", "Península"],
      }),
    ).score;
    expect(hot).toBeGreaterThan(cold);
  });

  it("adds a point when a plausible phone is supplied", () => {
    const base = draft({
      transactionType: "Comprar",
      budget: "$500k – $1.5M",
      timeframe: "De 3 a 6 meses",
      zones: ["Playa Mansa"],
      propertyType: "Apartamento",
    });
    const withPhone = scoreLead({ ...base, phone: "099123456" });
    const withoutPhone = scoreLead(base);
    expect(withPhone.breakdown.contact).toBeGreaterThan(
      withoutPhone.breakdown.contact,
    );
  });

  it("rewards a focused zone choice over selecting everything", () => {
    const focused = scoreLead(draft({ zones: ["José Ignacio"] })).breakdown.zone;
    const scattered = scoreLead(
      draft({ zones: ["La Barra", "Manantiales", "José Ignacio"] }),
    ).breakdown.zone;
    expect(focused).toBeGreaterThan(scattered);
  });

  it("returns a breakdown that sums (pre-clamp) consistently with inputs", () => {
    const { breakdown } = scoreLead(
      draft({
        timeframe: "De 3 a 6 meses", // 2
        budget: "Más de $3M", // 3
        zones: ["Manantiales"], // 1
        propertyType: "Penthouse", // 1
        transactionType: "Alquiler anual", // 0.5
      }),
    );
    expect(breakdown.timeframe).toBe(2);
    expect(breakdown.budget).toBe(3);
    expect(breakdown.zone).toBe(1);
    expect(breakdown.propertyType).toBe(1);
    expect(breakdown.transaction).toBe(0.5);
  });
});
