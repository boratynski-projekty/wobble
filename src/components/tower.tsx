"use client";

import { useOptimistic, useTransition } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { blockTilt } from "@/lib/tilt";
import { sortForTower } from "@/lib/tower/order";
import type { Block } from "@/lib/tower/types";
import { completeBlock, uncompleteBlock } from "@/app/(app)/today/actions";

type Props = { blocks: Block[] };

type Optimistic =
  { type: "complete"; id: string } | { type: "uncomplete"; id: string };

export function Tower({ blocks }: Props) {
  const [, startTransition] = useTransition();
  const reduceMotion = useReducedMotion();

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

  const standing = sortForTower(optimisticBlocks.filter((b) => !b.done_at));
  const removed = optimisticBlocks.filter((b) => b.done_at);

  function handleComplete(id: string) {
    // Krótki impuls przy wyjęciu klocka — fizyczność metafory.
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

  return (
    <div className="flex flex-col gap-6">
      <ul className="flex min-h-24 flex-col items-center gap-1.5">
        <AnimatePresence initial={false} mode="popLayout">
          {standing.map((block) => {
            const { rotate, offsetX } = blockTilt(
              block.seed,
              block.kind === "foundation",
            );
            const isFoundation = block.kind === "foundation";

            return (
              <motion.li
                key={block.id}
                layout={!reduceMotion}
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, x: offsetX, y: 0, rotate }}
                exit={
                  reduceMotion
                    ? { opacity: 0 }
                    : // Klocek wysuwa się w bok i znika — reszta wieży osiada
                      // dzięki `layout` na pozostałych elementach.
                      {
                        opacity: 0,
                        x: 220,
                        rotate: rotate + 8,
                        transition: { duration: 0.34 },
                      }
                }
                transition={{ type: "spring", stiffness: 320, damping: 30 }}
                className="w-full"
              >
                <button
                  type="button"
                  onClick={() => handleComplete(block.id)}
                  aria-label={`Wyjmij klocek: ${block.title}`}
                  style={{
                    boxShadow: "var(--shadow-block)",
                    borderRadius: "var(--radius-block)",
                  }}
                  className={`flex min-h-14 w-full items-center px-4 text-left text-sm font-medium transition-[filter] active:brightness-95 ${
                    isFoundation
                      ? "bg-foundation text-white"
                      : "bg-optional text-foreground"
                  }`}
                >
                  <span className="truncate">{block.title}</span>
                </button>
              </motion.li>
            );
          })}
        </AnimatePresence>

        {standing.length === 0 && (
          <li className="text-muted border-border w-full rounded-xl border border-dashed px-4 py-8 text-center text-sm text-balance">
            Wieża jest rozebrana. Dorzuć zadanie, żeby zbudować ją na dziś.
          </li>
        )}
      </ul>

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
                {/* Cofnięcie jest dostępne zawsze w obrębie dnia — bez timera, bez presji. */}
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
