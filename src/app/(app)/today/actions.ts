"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateTodayTower, getTimezone } from "@/lib/tower/queries";

/**
 * Każda mutacja klocka dopisuje wiersz do block_events. To jest fundament pod
 * historię dnia i cofanie (PLAN.md 4a) — dlatego powstaje razem z rdzeniem,
 * a nie „później": doklejenie tego potem oznaczałoby przepisanie wszystkich akcji.
 */
async function logEvent(
  supabase: Awaited<ReturnType<typeof createClient>>,
  towerId: string,
  blockId: string,
  type: "created" | "completed" | "uncompleted" | "deleted",
  payload: Record<string, unknown> = {},
): Promise<void> {
  await supabase
    .from("block_events")
    .insert({ tower_id: towerId, block_id: blockId, type, payload });
}

/** Wspólny wstęp akcji: zalogowany użytkownik + jego dzisiejsza wieża. */
async function currentTower() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Brak sesji");

  const timezone = await getTimezone(supabase, user.id);
  const tower = await getOrCreateTodayTower(supabase, user.id, timezone);
  return { supabase, tower };
}

/**
 * Dodanie zadania. Próg wejścia minimalny: jedno pole, bez kategorii.
 * Nowy klocek ląduje na górze wieży (najwyższa pozycja = najwyższy priorytet);
 * kolejność zmienia się potem ręcznie.
 */
export async function addBlock(formData: FormData): Promise<void> {
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;

  const { supabase, tower } = await currentTower();

  const { data: top } = await supabase
    .from("blocks")
    .select("position")
    .eq("tower_id", tower.id)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: created } = await supabase
    .from("blocks")
    .insert({
      tower_id: tower.id,
      title: title.slice(0, 200),
      position: (top?.position ?? 0) + 1,
    })
    .select("id")
    .single();

  if (created) {
    await logEvent(supabase, tower.id, created.id, "created", { title });
  }

  revalidatePath("/today");
}

/**
 * Zmiana priorytetu klocka — przesunięcie w górę/dół wieży. Zamieniamy pozycję
 * z sąsiadem w danym kierunku (wyżej = ważniejsze).
 */
export async function moveBlock(
  blockId: string,
  direction: "up" | "down",
): Promise<void> {
  const { supabase, tower } = await currentTower();

  const { data: blocks } = await supabase
    .from("blocks")
    .select("id, position")
    .eq("tower_id", tower.id)
    .is("deleted_at", null)
    .is("done_at", null)
    .order("position", { ascending: false });

  if (!blocks) return;

  // Lista jest od góry (najważniejsze) do dołu; „up" = w stronę początku listy.
  const idx = blocks.findIndex((b) => b.id === blockId);
  const neighbor = direction === "up" ? idx - 1 : idx + 1;
  if (idx < 0 || neighbor < 0 || neighbor >= blocks.length) return;

  const a = blocks[idx];
  const b = blocks[neighbor];
  await supabase.from("blocks").update({ position: b.position }).eq("id", a.id);
  await supabase.from("blocks").update({ position: a.position }).eq("id", b.id);

  revalidatePath("/today");
}

/** Wyjęcie klocka z wieży — czyli oznaczenie zadania jako zrobionego. */
export async function completeBlock(blockId: string): Promise<void> {
  const { supabase, tower } = await currentTower();

  await supabase
    .from("blocks")
    .update({ done_at: new Date().toISOString() })
    .eq("id", blockId);

  await logEvent(supabase, tower.id, blockId, "completed");
  revalidatePath("/today");
}

/**
 * Cofnięcie ukończenia — klocek wraca na swoje miejsce w wieży.
 * Dostępne zawsze w obrębie otwartego dnia, bez presji timera (PLAN.md 4a).
 */
export async function uncompleteBlock(blockId: string): Promise<void> {
  const { supabase, tower } = await currentTower();

  await supabase.from("blocks").update({ done_at: null }).eq("id", blockId);

  await logEvent(supabase, tower.id, blockId, "uncompleted");
  revalidatePath("/today");
}

/** Usunięcie zadania. Soft delete — nic nie znika z bazy na stałe. */
export async function deleteBlock(blockId: string): Promise<void> {
  const { supabase, tower } = await currentTower();

  await supabase
    .from("blocks")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", blockId);

  await logEvent(supabase, tower.id, blockId, "deleted");
  revalidatePath("/today");
}
