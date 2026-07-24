import { blockTilt } from "@/lib/tilt";
import { BlockFace } from "./block-face";
import type { BlockKind } from "@/lib/tower/types";

/**
 * Statyczny podgląd wieży na landingu i w trybie demo. Używa tego samego BlockFace
 * co żywa wieża na /today, żeby wygląd był jednym źródłem prawdy i dało się go
 * iterować lokalnie bez logowania.
 */

const PREVIEW_BLOCKS: { seed: number; title: string; kind: BlockKind }[] = [
  { seed: 41, title: "Odpisać na maila od Kasi", kind: "optional" },
  { seed: 33, title: "Ogarnąć pranie", kind: "optional" },
  { seed: 27, title: "Kupić prezent", kind: "optional" },
  { seed: 12, title: "Wysłać fakturę", kind: "foundation" },
  { seed: 4, title: "Zadzwonić do przychodni", kind: "foundation" },
];

export function TowerPreview() {
  return (
    <div className="mx-auto w-full max-w-[300px]">
      <ul className="flex flex-col items-center">
        {PREVIEW_BLOCKS.map((block) => {
          const isFoundation = block.kind === "foundation";
          const { rotate, offsetX } = blockTilt(block.seed, isFoundation);
          return (
            <li
              key={block.seed}
              style={{
                transform: `translateX(${offsetX}px) rotate(${rotate}deg)`,
              }}
              className="flex w-full justify-center"
            >
              <BlockFace
                title={block.title}
                kind={block.kind}
                seed={block.seed}
              />
            </li>
          );
        })}
      </ul>
      <div className="mx-auto mt-1 h-3 w-[78%] rounded-[50%] bg-black/15 blur-md dark:bg-black/40" />
    </div>
  );
}
