"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateTodayTower, getTimezone } from "@/lib/tower/queries";
import type { BlockKind } from "@/lib/tower/types";

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
 * Dodanie zadania. Próg wejścia ma być minimalny: jedno pole + jeden tap na
 * kategorię, bez dodatkowych kroków (koncepcja, 3.1).
 */
export async function addBlock(formData: FormData): Promise<void> {
  const title = String(formData.get("title") ?? "").trim();
  const kind = (
    String(formData.get("kind") ?? "optional") === "foundation"
      ? "foundation"
      : "optional"
  ) as BlockKind;

  if (!title) return;

  const { supabase, tower } = await currentTower();

  // Nowy klocek ląduje na wierzchu swojej grupy.
  const { data: last } = await supabase
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
      kind,
      position: (last?.position ?? 0) + 1,
    })
    .select("id")
    .single();

  if (created) {
    await logEvent(supabase, tower.id, created.id, "created", { title, kind });
  }

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
