import Link from "next/link";
import { redirect } from "next/navigation";
import { TowerPreview } from "@/components/tower-preview";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  // Zalogowanych prowadzimy prosto do ich wieży.
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) redirect("/today");
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-10 px-6 py-16">
      <div className="space-y-2 text-center">
        <h1 className="text-4xl font-semibold tracking-tight">Wobble</h1>
        <p className="text-muted text-balance">
          Twoje zadania to klocki w chwiejnej wieży. Rano stoi pełna, wieczorem
          powinna być rozebrana.
        </p>
      </div>

      <TowerPreview />

      {isSupabaseConfigured() ? (
        <Link
          href="/login"
          className="bg-foundation flex h-12 w-full items-center justify-center rounded-xl font-medium text-white transition-opacity hover:opacity-90"
        >
          Zaczynamy
        </Link>
      ) : (
        <p className="text-muted text-center text-sm">
          Faza 1 — logowanie gotowe w kodzie, czeka na podłączenie Supabase.
        </p>
      )}
    </main>
  );
}
