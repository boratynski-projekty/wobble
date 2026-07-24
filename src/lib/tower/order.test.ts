import { describe, expect, it } from "vitest";
import { byPriority, stackFromBottom } from "./order";
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

describe("byPriority", () => {
  it("najważniejsze (wyższa pozycja) na górze wieży", () => {
    const out = byPriority([
      block({ id: "niska", position: 1 }),
      block({ id: "wysoka", position: 5 }),
      block({ id: "srednia", position: 3 }),
    ]);
    expect(out.map((b) => b.id)).toEqual(["wysoka", "srednia", "niska"]);
  });

  it("nie mutuje wejścia", () => {
    const input = [
      block({ id: "a", position: 1 }),
      block({ id: "b", position: 2 }),
    ];
    const copy = [...input];
    byPriority(input);
    expect(input).toEqual(copy);
  });
});

describe("stackFromBottom", () => {
  it("odwraca kolejność — najmniej ważne na spodzie stosu", () => {
    const out = stackFromBottom([
      block({ id: "wysoka", position: 5 }),
      block({ id: "niska", position: 1 }),
    ]);
    expect(out.map((b) => b.id)).toEqual(["niska", "wysoka"]);
  });
});
