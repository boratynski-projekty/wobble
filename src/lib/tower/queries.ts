import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { localDateFor } from "./local-date";
import type { Block, Tower } from "./types";

const DEFAULT_TIMEZONE = "Europe/Warsaw";

/** Strefa z profilu decyduje, który dzień jest „dzisiaj". */
export async function getTimezone(
  supabase: SupabaseClient,
  userId: string,
): Promise<string> {
  const { data } = await supabase
    .from("profiles")
    .select("timezone")
    .eq("id", userId)
    .maybeSingle();

  return data?.timezone ?? DEFAULT_TIMEZONE;
}

/**
 * Dzisiejsza wieża użytkownika — tworzona leniwie przy pierwszym wejściu w dany dzień.
 * Pusta wieża czekająca rano na zadania to celowy element produktu („niedokończona
 * historia", PLAN.md sekcja 1), a nie efekt uboczny.
 */
export async function getOrCreateTodayTower(
  supabase: SupabaseClient,
  userId: string,
  timezone: string,
): Promise<Tower> {
  const localDate = localDateFor(timezone);

  const { data: existing } = await supabase
    .from("towers")
    .select("id, local_date, status")
    .eq("user_id", userId)
    .eq("local_date", localDate)
    .maybeSingle();

  if (existing) return existing as Tower;

  const { data: created, error } = await supabase
    .from("towers")
    .insert({ user_id: userId, local_date: localDate })
    .select("id, local_date, status")
    .single();

  if (created) return created as Tower;

  // Wyścig: równoległe żądanie zdążyło utworzyć wieżę (unique user_id+local_date).
  // Pobieramy ją zamiast zwracać błąd.
  const { data: raced } = await supabase
    .from("towers")
    .select("id, local_date, status")
    .eq("user_id", userId)
    .eq("local_date", localDate)
    .maybeSingle();

  if (raced) return raced as Tower;

  throw new Error(`Nie udało się utworzyć wieży: ${error?.message}`);
}

/** Klocki wieży — bez usuniętych (soft delete, PLAN.md 4a). */
export async function getBlocks(
  supabase: SupabaseClient,
  towerId: string,
): Promise<Block[]> {
  const { data } = await supabase
    .from("blocks")
    .select("id, title, kind, position, done_at, seed")
    .eq("tower_id", towerId)
    .is("deleted_at", null)
    .order("position", { ascending: true });

  return (data ?? []) as Block[];
}
