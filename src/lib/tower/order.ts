import type { Block } from "./types";

/**
 * Kolejność klocków w wieży, od góry ekranu do dołu.
 *
 * Fundamenty zawsze lądują u podstawy (na końcu listy) — to jest wymóg z koncepcji:
 * na pierwszy rzut oka ma być widać, co jest krytyczne. W obrębie grupy starsze
 * klocki leżą niżej, nowe dokładamy na wierzch.
 */
export function sortForTower(blocks: Block[]): Block[] {
  return [...blocks].sort((a, b) => {
    if (a.kind !== b.kind) return a.kind === "foundation" ? 1 : -1;
    return b.position - a.position;
  });
}

/** Czy wieża może stać na koniec dnia — decydują wyłącznie fundamenty. */
export function survivesTheDay(blocks: Block[]): boolean {
  return blocks
    .filter((b) => b.kind === "foundation")
    .every((b) => b.done_at !== null);
}
