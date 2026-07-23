"use client";

import { useRef, useState } from "react";
import { addBlock } from "@/app/(app)/today/actions";
import type { BlockKind } from "@/lib/tower/types";

/**
 * Dodawanie zadania: jedno pole + jeden tap na kategorię. Bez modala, bez kroków.
 * Po wysłaniu pole zostaje aktywne, żeby dało się dorzucić kolejne zadanie ciągiem —
 * poranne budowanie wieży ma trwać sekundy (koncepcja, 3.1).
 */
export function AddBlockForm() {
  const [kind, setKind] = useState<BlockKind>("optional");
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await addBlock(formData);
        formRef.current?.reset();
        inputRef.current?.focus();
      }}
      className="flex flex-col gap-3"
    >
      <input type="hidden" name="kind" value={kind} />

      <input
        ref={inputRef}
        name="title"
        required
        maxLength={200}
        autoComplete="off"
        placeholder="Co masz dziś do zrobienia?"
        className="border-border bg-surface focus:border-foundation h-12 rounded-xl border px-4 text-base transition-colors outline-none"
      />

      <div className="flex gap-2">
        <KindToggle
          active={kind === "foundation"}
          onClick={() => setKind("foundation")}
          label="Fundament"
          hint="bez tego wieża się zawali"
        />
        <KindToggle
          active={kind === "optional"}
          onClick={() => setKind("optional")}
          label="Opcjonalne"
          hint="miło, ale nie krytyczne"
        />
      </div>

      <button
        type="submit"
        className="bg-foundation h-12 rounded-xl font-medium text-white transition-opacity hover:opacity-90"
      >
        Dołóż klocek
      </button>
    </form>
  );
}

function KindToggle({
  active,
  onClick,
  label,
  hint,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  hint: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      title={hint}
      className={`min-h-11 flex-1 rounded-xl border px-3 text-sm font-medium transition-colors ${
        active
          ? "border-foundation bg-foundation-soft text-foreground"
          : "border-border text-muted"
      }`}
    >
      {label}
    </button>
  );
}
