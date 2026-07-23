import { createClient } from "@/lib/supabase/server";
import {
  getBlocks,
  getOrCreateTodayTower,
  getTimezone,
} from "@/lib/tower/queries";
import { Tower } from "@/components/tower";
import { AddBlockForm } from "@/components/add-block-form";
import { survivesTheDay } from "@/lib/tower/order";

export default async function TodayPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const timezone = await getTimezone(supabase, user!.id);
  const tower = await getOrCreateTodayTower(supabase, user!.id, timezone);
  const blocks = await getBlocks(supabase, tower.id);

  const foundations = blocks.filter((b) => b.kind === "foundation");
  const pendingFoundations = foundations.filter((b) => !b.done_at).length;

  return (
    <main className="flex flex-col gap-8">
      <header className="space-y-1">
        <p className="text-muted text-sm">{formatDate(tower.local_date)}</p>
        <h1 className="text-2xl font-semibold tracking-tight">
          {headline(blocks.length, pendingFoundations, survivesTheDay(blocks))}
        </h1>
      </header>

      <Tower blocks={blocks} />

      <AddBlockForm />
    </main>
  );
}

/** Nagłówek mówi, co jest do zrobienia — bez oceniania i bez pogania. */
function headline(
  total: number,
  pendingFoundations: number,
  survives: boolean,
): string {
  if (total === 0) return "Pusta wieża czeka";
  if (pendingFoundations > 0) {
    return pendingFoundations === 1
      ? "Został jeden fundament"
      : `Zostały ${pendingFoundations} fundamenty`;
  }
  return survives ? "Fundamenty zrobione" : "Twoja wieża";
}

function formatDate(localDate: string): string {
  return new Intl.DateTimeFormat("pl-PL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    // Data jest już lokalna dla użytkownika — formatujemy ją bez przeliczania stref.
    timeZone: "UTC",
  }).format(new Date(`${localDate}T12:00:00Z`));
}
