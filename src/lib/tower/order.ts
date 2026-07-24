import type { Block } from "./types";

/**
 * Kolejność klocków w wieży, od GÓRY (najważniejsze) do DOŁU.
 *
 * Po zwrocie projektowym (2026-07-24) nie ma już podziału fundament/opcjonalne —
 * liczy się wyłącznie ręczna kolejność priorytetu. Najważniejsze zadania układa się
 * na górze, żeby wyjmować je z wierzchu i nie ruszać mniej ważnych z dołu.
 * Wyższa `position` = wyższy priorytet = wyżej w wieży.
 */
export function byPriority(blocks: Block[]): Block[] {
  return [...blocks].sort((a, b) => b.position - a.position);
}

/**
 * Kolejność układania w stosie 3D, od DOŁU do góry: najmniej ważne na spodzie,
 * najważniejsze na szczycie. To odwrócenie byPriority — używane przez scenę 3D,
 * która buduje wieżę warstwami od podstawy.
 */
export function stackFromBottom(blocks: Block[]): Block[] {
  return [...blocks].sort((a, b) => a.position - b.position);
}
