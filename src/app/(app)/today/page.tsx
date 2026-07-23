import { createClient } from "@/lib/supabase/server";
import { TowerPreview } from "@/components/tower-preview";

/**
 * Ekran „Dziś". Na razie wita użytkownika i pokazuje statyczny podgląd wieży.
 * Realna wieża — dodawanie zadań, wyjmowanie klocków — powstaje w fazie 2.
 */
export default async function TodayPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const greeting =
    (user?.user_metadata?.full_name as string | undefined) ??
    user?.email?.split("@")[0] ??
    "Cześć";

  return (
    <main className="flex flex-col gap-8">
      <header className="space-y-1">
        <p className="text-muted text-sm">Twoja dzisiejsza wieża</p>
        <h1 className="text-2xl font-semibold tracking-tight">{greeting} 👋</h1>
      </header>

      <TowerPreview />

      <p className="text-muted text-center text-sm text-balance">
        Faza 1 — logowanie działa. Dodawanie i wyjmowanie klocków dochodzi w
        fazie 2.
      </p>
    </main>
  );
}
