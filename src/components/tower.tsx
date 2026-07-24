"use client";

import { useOptimistic, useTransition } from "react";
import dynamic from "next/dynamic";
import { byPriority } from "@/lib/tower/order";
import type { Block } from "@/lib/tower/types";
import {
  completeBlock,
  moveBlock,
  uncompleteBlock,
} from "@/app/(app)/today/actions";

// Scena 3D (Three.js) jest ciężka i działa tylko w przeglądarce — ładujemy ją
// dynamicznie, bez SSR, z lekkim placeholderem na czas pobierania paczki.
const Tower3DScene = dynamic(
  () => import("./tower-3d-scene").then((m) => m.Tower3DScene),
  {
    ssr: false,
    loading: () => (
      <div className="text-muted flex h-[420px] items-center justify-center text-sm">
        Buduję wieżę…
      </div>
    ),
  },
);

type Props = { blocks: Block[] };

type Optimistic =
  { type: "complete"; id: string } | { type: "uncomplete"; id: string };

export function Tower({ blocks }: Props) {
  const [, startTransition] = useTransition();

  const [optimisticBlocks, applyOptimistic] = useOptimistic(
    blocks,
    (state: Block[], action: Optimistic) =>
      state.map((b) =>
        b.id === action.id
          ? {
              ...b,
              done_at:
                action.type === "complete" ? new Date().toISOString() : null,
            }
          : b,
      ),
  );

  const standing = byPriority(optimisticBlocks.filter((b) => !b.done_at));
  const removed = optimisticBlocks.filter((b) => b.done_at);

  function handleComplete(id: string) {
    navigator.vibrate?.(12);
    startTransition(async () => {
      applyOptimistic({ type: "complete", id });
      await completeBlock(id);
    });
  }

  function handleUndo(id: string) {
    startTransition(async () => {
      applyOptimistic({ type: "uncomplete", id });
      await uncompleteBlock(id);
    });
  }

  function handleMove(id: string, direction: "up" | "down") {
    startTransition(async () => {
      await moveBlock(id, direction);
    });
  }

  return (
    <div className="flex flex-col gap-6">
      {standing.length > 0 ? (
        <Tower3DScene blocks={standing} onComplete={handleComplete} />
      ) : (
        <div className="text-muted border-border rounded-xl border border-dashed px-4 py-10 text-center text-sm text-balance">
          Wieża jest rozebrana. Dorzuć zadanie, żeby zbudować ją na dziś.
        </div>
      )}

      {/* Lista priorytetów: kolejność wieży od góry (najważniejsze) do dołu,
          ze strzałkami do przestawiania i podglądem co jest gdzie. */}
      {standing.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="text-muted text-xs font-medium tracking-wide uppercase">
            Kolejność — najważniejsze u góry
          </h2>
          <ul className="flex flex-col gap-1.5">
            {standing.map((block, i) => (
              <li
                key={block.id}
                className="border-border flex items-center gap-2 rounded-lg border px-3 py-2"
              >
                <span className="flex-1 truncate text-sm">{block.title}</span>
                <button
                  type="button"
                  onClick={() => handleMove(block.id, "up")}
                  disabled={i === 0}
                  aria-label={`Wyżej: ${block.title}`}
                  className="text-muted disabled:opacity-30"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => handleMove(block.id, "down")}
                  disabled={i === standing.length - 1}
                  aria-label={`Niżej: ${block.title}`}
                  className="text-muted disabled:opacity-30"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => handleComplete(block.id)}
                  aria-label={`Wyjmij klocek: ${block.title}`}
                  className="text-foundation-deep ml-1 text-xs font-medium underline"
                >
                  Gotowe
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {removed.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="text-muted text-xs font-medium tracking-wide uppercase">
            Wyjęte dziś ({removed.length})
          </h2>
          <ul className="flex flex-col gap-1.5">
            {removed.map((block) => (
              <li
                key={block.id}
                className="border-border flex items-center gap-3 rounded-lg border px-3 py-2"
              >
                <span className="text-muted flex-1 truncate text-sm line-through">
                  {block.title}
                </span>
                {/* Cofnięcie zawsze dostępne w obrębie dnia — bez timera, bez presji. */}
                <button
                  type="button"
                  onClick={() => handleUndo(block.id)}
                  className="text-foundation-deep shrink-0 text-xs font-medium underline"
                >
                  Cofnij
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
