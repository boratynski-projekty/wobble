import { createClient } from "@/lib/supabase/server";
import {
  getBlocks,
  getOrCreateTodayTower,
  getTimezone,
} from "@/lib/tower/queries";
import { Tower } from "@/components/tower";
import { AddBlockForm } from "@/components/add-block-form";

export default async function TodayPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const timezone = await getTimezone(supabase, user!.id);
  const tower = await getOrCreateTodayTower(supabase, user!.id, timezone);
  const blocks = await getBlocks(supabase, tower.id);

  const pending = blocks.filter((b) => !b.done_at).length;

  return (
    <main className="flex flex-col gap-8">
      <header className="space-y-1">
        <p className="text-muted text-sm">{formatDate(tower.local_date)}</p>
        <h1 className="text-2xl font-semibold tracking-tight">
          {headline(blocks.length, pending)}
        </h1>
      </header>

      <Tower blocks={blocks} />

      <AddBlockForm />
    </main>
  );
}

/** Nagłówek mówi, ile zostało — bez oceniania i bez pogania. */
function headline(total: number, pending: number): string {
  if (total === 0) return "Pusta wieża czeka";
  if (pending === 0) return "Wieża rozebrana 🎉";
  if (pending === 1) return "Został ostatni klocek";
  return `${pending} klocki do wyjęcia`;
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
