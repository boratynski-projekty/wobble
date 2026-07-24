"use client";

import { useOptimistic, useTransition } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { blockTilt } from "@/lib/tilt";
import { sortForTower } from "@/lib/tower/order";
import type { Block } from "@/lib/tower/types";
import { completeBlock, uncompleteBlock } from "@/app/(app)/today/actions";
import { BlockFace } from "./block-face";

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
      <div className="mx-auto w-full max-w-[300px]">
        {/* Klocki stykają się bez odstępów — fugę rysuje cień jednego na drugim. */}
        <ul className="flex flex-col items-center">
          <AnimatePresence initial={false} mode="popLayout">
            {standing.map((block) => {
              const { rotate, offsetX } = blockTilt(
                block.seed,
                block.kind === "foundation",
              );

              return (
                <motion.li
                  key={block.id}
                  layout={!reduceMotion}
                  initial={{ opacity: 0, y: -14 }}
                  animate={{ opacity: 1, x: offsetX, y: 0, rotate }}
                  exit={
                    reduceMotion
                      ? { opacity: 0 }
                      : // Klocek wysuwa się w bok i znika — reszta wieży osiada
                        // dzięki `layout` na pozostałych elementach.
                        {
                          opacity: 0,
                          x: 240,
                          rotate: rotate + 10,
                          transition: { duration: 0.34 },
                        }
                  }
                  transition={{ type: "spring", stiffness: 320, damping: 30 }}
                  className="flex w-full justify-center"
                >
                  <button
                    type="button"
                    onClick={() => handleComplete(block.id)}
                    aria-label={`Wyjmij klocek: ${block.title}`}
                    className="focus-visible:ring-foundation flex w-full justify-center rounded-[3px] outline-none focus-visible:ring-2 active:brightness-[0.97]"
                  >
                    <BlockFace
                      title={block.title}
                      kind={block.kind}
                      seed={block.seed}
                    />
                  </button>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>

        {standing.length > 0 ? (
          // Cień na ziemi — kotwiczy wieżę, żeby nie „unosiła się" w powietrzu.
          <div className="mx-auto mt-1 h-3 w-[78%] rounded-[50%] bg-black/15 blur-md dark:bg-black/40" />
        ) : (
          <div className="text-muted border-border rounded-xl border border-dashed px-4 py-10 text-center text-sm text-balance">
            Wieża jest rozebrana. Dorzuć zadanie, żeby zbudować ją na dziś.
          </div>
        )}
      </div>

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
