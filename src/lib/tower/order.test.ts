import { describe, expect, it } from "vitest";
import { sortForTower, survivesTheDay } from "./order";
import type { Block } from "./types";

function block(p: Partial<Block> & { id: string }): Block {
  return {
    title: p.id,
    kind: "optional",
    position: 0,
    done_at: null,
    seed: 1,
    ...p,
  };
}

describe("sortForTower", () => {
  it("kładzie fundamenty na dole wieży", () => {
    const out = sortForTower([
      block({ id: "f", kind: "foundation", position: 1 }),
      block({ id: "o", kind: "optional", position: 2 }),
    ]);
    // Ostatni element listy = podstawa wieży.
    expect(out.at(-1)!.id).toBe("f");
  });

  it("nowsze klocki układa wyżej w obrębie grupy", () => {
    const out = sortForTower([
      block({ id: "stary", position: 1 }),
      block({ id: "nowy", position: 5 }),
    ]);
    expect(out.map((b) => b.id)).toEqual(["nowy", "stary"]);
  });

  it("nie mutuje wejścia", () => {
    const input = [
      block({ id: "a", position: 1 }),
      block({ id: "b", position: 2 }),
    ];
    const copy = [...input];
    sortForTower(input);
    expect(input).toEqual(copy);
  });
});

describe("survivesTheDay", () => {
  it("stoi, gdy wszystkie fundamenty zrobione — nawet z zaległymi opcjonalnymi", () => {
    expect(
      survivesTheDay([
        block({ id: "f", kind: "foundation", done_at: "2026-07-24T10:00:00Z" }),
        block({ id: "o", kind: "optional", done_at: null }),
      ]),
    ).toBe(true);
  });

  it("zawala się, gdy choć jeden fundament został niezrobiony", () => {
    expect(
      survivesTheDay([
        block({
          id: "f1",
          kind: "foundation",
          done_at: "2026-07-24T10:00:00Z",
        }),
        block({ id: "f2", kind: "foundation", done_at: null }),
      ]),
    ).toBe(false);
  });

  it("pusta wieża stoi — brak zadań to nie porażka", () => {
    expect(survivesTheDay([])).toBe(true);
  });
});
