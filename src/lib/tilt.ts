/**
 * Deterministyczny przechył klocka.
 *
 * Wieża ma wyglądać na ułożoną ręcznie, a nie wygenerowaną z tabelki — każdy klocek
 * dostaje drobny, losowy przechył i przesunięcie w poziomie. Musi to być jednak
 * deterministyczne: ten sam klocek ma wyglądać identycznie po odświeżeniu strony,
 * przy renderze serwerowym i po cofnięciu ukończenia (zob. PLAN.md 4a).
 * Dlatego źródłem "losowości" jest zapisany w bazie `seed` klocka, nie Math.random().
 */

const MAX_TILT_DEG = 1.6;
const MAX_OFFSET_PX = 5;

/** Mulberry32 — mały, szybki PRNG. Zwraca liczbę z przedziału [0, 1). */
function random(seed: number): number {
  let t = (seed + 0x6d2b79f5) | 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

export type BlockTilt = {
  /** Obrót klocka w stopniach. */
  rotate: number;
  /** Przesunięcie w poziomie w pikselach. */
  offsetX: number;
};

/**
 * Fundamenty są u podstawy wieży i mają dźwigać resztę, więc chwieją się wyraźnie
 * mniej niż klocki opcjonalne — inaczej wieża wygląda, jakby zaraz padła bez powodu.
 */
export function blockTilt(seed: number, isFoundation = false): BlockTilt {
  const damping = isFoundation ? 0.35 : 1;
  return {
    rotate: (random(seed) * 2 - 1) * MAX_TILT_DEG * damping,
    offsetX: (random(seed + 1) * 2 - 1) * MAX_OFFSET_PX * damping,
  };
}
