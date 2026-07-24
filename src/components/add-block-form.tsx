"use client";

import { useRef } from "react";
import { addBlock } from "@/app/(app)/today/actions";

/**
 * Dodawanie zadania: jedno pole, bez kategorii. Nowy klocek ląduje na górze wieży
 * (najwyższy priorytet) — kolejność zmienia się potem ręcznie. Po wysłaniu pole
 * zostaje aktywne, żeby dorzucać zadania ciągiem (koncepcja, 3.1).
 */
export function AddBlockForm() {
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
      className="flex gap-2"
    >
      <input
        ref={inputRef}
        name="title"
        required
        maxLength={200}
        autoComplete="off"
        placeholder="Co masz dziś do zrobienia?"
        className="border-border bg-surface focus:border-foundation h-12 flex-1 rounded-xl border px-4 text-base transition-colors outline-none"
      />
      <button
        type="submit"
        aria-label="Dołóż klocek na górę wieży"
        className="bg-foundation h-12 shrink-0 rounded-xl px-5 font-medium text-white transition-opacity hover:opacity-90"
      >
        Dołóż
      </button>
    </form>
  );
}
