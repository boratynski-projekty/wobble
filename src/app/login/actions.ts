"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export type LoginState = {
  status: "idle" | "sent" | "error";
  message?: string;
};

/** Origin bieżącego żądania — używamy go do zbudowania adresów zwrotnych auth. */
async function requestOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host")!;
  const proto = h.get("x-forwarded-proto") ?? "https";
  return `${proto}://${host}`;
}

/**
 * Logowanie magic linkiem. Domyślna metoda w Wobble — jedno pole, zero haseł,
 * zgodnie z filozofią „niski próg wejścia" (PLAN.md). Wysyłamy link, a jego
 * kliknięcie trafia do /auth/confirm, które finalizuje sesję.
 */
export async function signInWithEmail(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  if (!isSupabaseConfigured()) {
    return {
      status: "error",
      message: "Logowanie nie jest jeszcze skonfigurowane.",
    };
  }

  const email = String(formData.get("email") ?? "").trim();
  if (!email || !email.includes("@")) {
    return { status: "error", message: "Podaj poprawny adres e-mail." };
  }

  const next = String(formData.get("next") ?? "/today");
  const supabase = await createClient();
  const origin = await requestOrigin();

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${origin}/auth/confirm?next=${encodeURIComponent(next)}`,
    },
  });

  if (error) {
    return {
      status: "error",
      message: "Nie udało się wysłać linku. Spróbuj ponownie.",
    };
  }

  return {
    status: "sent",
    message: `Wysłaliśmy link na ${email}. Sprawdź skrzynkę.`,
  };
}

/**
 * Logowanie przez Google. Server action zwraca URL dostawcy, na który
 * przekierowujemy przeglądarkę; reszta dzieje się w /auth/callback.
 */
export async function signInWithGoogle(formData: FormData): Promise<void> {
  if (!isSupabaseConfigured()) return;

  const next = String(formData.get("next") ?? "/today");
  const supabase = await createClient();
  const origin = await requestOrigin();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });

  if (error || !data.url) {
    redirect(`/login?error=google`);
  }

  redirect(data.url);
}
