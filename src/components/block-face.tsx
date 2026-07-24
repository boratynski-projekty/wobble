import type { CSSProperties, ReactNode } from "react";
import { blockWidthPct } from "@/lib/tilt";
import type { BlockKind } from "@/lib/tower/types";

/**
 * Wygląd pojedynczego klocka wieży — bryła drewna/betonu, nie element listy.
 *
 * Co sprawia, że to czyta się jako klocek, a nie wiersz:
 * - gradient góra→dół daje wrażenie oświetlenia z góry i grubości,
 * - wewnętrzne cienie (bevel) rysują górną krawędź i spód bryły,
 * - cień rzucany na klocek poniżej tworzy „fugę" między stykającymi się klockami,
 * - przyciemnione boki to sugestia przekroju drewna na końcach klocka,
 * - delikatne poziome smugi to usłojenie.
 * Wszystko na tokenach z globals.css, więc działa w light i dark.
 */

type Props = {
  title: string;
  kind: BlockKind;
  seed: number;
  children?: ReactNode;
};

export function BlockFace({ title, kind, seed, children }: Props) {
  const isFoundation = kind === "foundation";
  const widthPct = blockWidthPct(seed, isFoundation);

  const style: CSSProperties = {
    width: `${widthPct}%`,
    minHeight: isFoundation ? 60 : 52,
    borderRadius: 3,
    color: isFoundation ? "#fff" : "var(--foreground)",
    backgroundImage: [
      // usłojenie — subtelne poziome smugi
      "repeating-linear-gradient(180deg, transparent 0 3px, rgba(0,0,0,0.028) 3px 4px)",
      // przyciemnione końce klocka (przekrój drewna)
      "linear-gradient(90deg, rgba(0,0,0,0.16) 0, transparent 4%, transparent 96%, rgba(0,0,0,0.16) 100%)",
      // bryła z oświetleniem z góry
      isFoundation
        ? "linear-gradient(180deg, var(--foundation-soft) 0%, var(--foundation) 42%, var(--foundation) 66%, var(--foundation-deep) 100%)"
        : "linear-gradient(180deg, var(--optional-soft) 0%, var(--optional) 44%, var(--optional) 68%, var(--optional-deep) 100%)",
    ].join(","),
    boxShadow: [
      "inset 0 1.5px 0 rgba(255,255,255,0.3)", // górna krawędź — światło
      "inset 0 -2px 3px rgba(0,0,0,0.2)", // spód — grubość bryły
      "var(--shadow-block)", // cień rzucany na klocek poniżej = fuga
    ].join(","),
  };

  return (
    <div
      style={style}
      className="mx-auto flex items-center px-4 text-sm font-medium"
    >
      <span className="truncate">{title}</span>
      {children}
    </div>
  );
}
