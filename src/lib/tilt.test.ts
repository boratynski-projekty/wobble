import { describe, expect, it } from "vitest";
import { blockTilt } from "./tilt";

describe("blockTilt", () => {
  it("zwraca ten sam wynik dla tego samego seeda", () => {
    // Kluczowe: klocek musi wyglądać identycznie po SSR, po odświeżeniu
    // i po cofnięciu ukończenia (PLAN.md 4a).
    expect(blockTilt(42)).toEqual(blockTilt(42));
  });

  it("różnicuje klocki o różnych seedach", () => {
    expect(blockTilt(1)).not.toEqual(blockTilt(2));
  });

  it("utrzymuje przechył w zakresie, który nie psuje czytelności", () => {
    for (let seed = 0; seed < 500; seed++) {
      const { rotate, offsetX } = blockTilt(seed);
      expect(Math.abs(rotate)).toBeLessThanOrEqual(1.6);
      expect(Math.abs(offsetX)).toBeLessThanOrEqual(5);
    }
  });

  it("chwieje fundamentami wyraźnie mniej niż klockami opcjonalnymi", () => {
    // Fundamenty dźwigają wieżę — gdyby chwiały się tak samo, wieża wyglądałaby,
    // jakby miała paść bez powodu.
    for (let seed = 0; seed < 100; seed++) {
      const foundation = blockTilt(seed, true);
      const optional = blockTilt(seed, false);
      expect(Math.abs(foundation.rotate)).toBeLessThan(
        Math.abs(optional.rotate) + Number.EPSILON,
      );
    }
  });
});
