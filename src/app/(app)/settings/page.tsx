import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/auth/actions";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="flex flex-col gap-8">
      <h1 className="text-2xl font-semibold tracking-tight">Ustawienia</h1>

      <section className="border-border bg-surface rounded-2xl border p-5">
        <p className="text-muted text-sm">Zalogowano jako</p>
        <p className="mt-1 font-medium break-all">{user?.email}</p>
      </section>

      <p className="text-muted text-sm text-balance">
        Godzina zamknięcia dnia, przypomnienia i skórki wieży pojawią się w
        kolejnych fazach.
      </p>

      <form action={signOut}>
        <button
          type="submit"
          className="border-border h-12 w-full rounded-xl border font-medium transition-colors hover:brightness-95"
        >
          Wyloguj się
        </button>
      </form>
    </main>
  );
}
