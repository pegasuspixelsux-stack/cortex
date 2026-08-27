import { describe, it, expect } from "vitest";
import { fitWithin } from "./imageOptimizer";

describe("fitWithin", () => {
  it("leaves images already within the limit untouched", () => {
    expect(fitWithin(1600, 900, 2048)).toEqual({ width: 1600, height: 900 });
    expect(fitWithin(2048, 2048, 2048)).toEqual({ width: 2048, height: 2048 });
  });

  it("scales a wide image so the long edge hits the limit", () => {
    expect(fitWithin(4096, 2048, 2048)).toEqual({ width: 2048, height: 1024 });
  });

  it("scales a tall image so the long edge hits the limit", () => {
    expect(fitWithin(3000, 6000, 2048)).toEqual({ width: 1024, height: 2048 });
  });

  it("preserves aspect ratio within rounding", () => {
    const { width, height } = fitWithin(4000, 3000, 2048);
    expect(width).toBe(2048);
    expect(Math.abs(width / height - 4000 / 3000)).toBeLessThan(0.01);
  });

  it("never upscales", () => {
    expect(fitWithin(800, 600, 2048)).toEqual({ width: 800, height: 600 });
  });
});
