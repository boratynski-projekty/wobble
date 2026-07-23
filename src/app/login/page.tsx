import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  // Zalogowanych nie trzymamy na ekranie logowania.
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) redirect("/today");
  }

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-8 px-6 py-16">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">Wobble</h1>
        <p className="text-muted text-balance">
          Zaloguj się, żeby zbudować dzisiejszą wieżę.
        </p>
      </div>

      {isSupabaseConfigured() ? (
        <Suspense>
          <LoginForm />
        </Suspense>
      ) : (
        <div className="border-border bg-surface text-muted rounded-2xl border p-6 text-center text-sm text-balance">
          Logowanie zostanie uruchomione po podłączeniu Supabase. Na razie
          możesz obejrzeć{" "}
          <Link href="/" className="text-foundation-deep underline">
            podgląd wieży
          </Link>
          .
        </div>
      )}
    </main>
  );
}
