import { blockTilt } from "@/lib/tilt";

/**
 * Statyczny podgląd wieży — smoke test design tokenów i funkcji przechyłu.
 * Nie jest to docelowy komponent wieży; ten powstaje w fazie 2 razem z modelem danych.
 */

const PREVIEW_BLOCKS = [
  { id: 4, title: "Odpisać na maila od Kasi", foundation: false },
  { id: 3, title: "Ogarnąć pranie", foundation: false },
  { id: 2, title: "Kupić prezent", foundation: false },
  { id: 1, title: "Wysłać fakturę", foundation: true },
  { id: 0, title: "Zadzwonić do przychodni", foundation: true },
];

export function TowerPreview() {
  return (
    <ul className="flex w-full flex-col items-center gap-1.5">
      {PREVIEW_BLOCKS.map((block) => {
        const { rotate, offsetX } = blockTilt(block.id, block.foundation);
        return (
          <li
            key={block.id}
            style={{
              transform: `translateX(${offsetX}px) rotate(${rotate}deg)`,
              boxShadow: "var(--shadow-block)",
              borderRadius: "var(--radius-block)",
            }}
            className={`flex h-14 w-full items-center px-4 text-sm font-medium ${
              block.foundation
                ? "bg-foundation text-white"
                : "bg-optional text-foreground"
            }`}
          >
            <span className="truncate">{block.title}</span>
          </li>
        );
      })}
    </ul>
  );
}
