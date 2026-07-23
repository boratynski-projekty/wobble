/**
 * Wobble łączy się z Supabase dopiero od fazy 1. Dopóki użytkownik nie wklei kluczy
 * (lokalnie do .env.local, na Vercelu do Environment Variables), aplikacja ma działać
 * w trybie demo — landing i statyczny podgląd wieży — zamiast wywalać się białym ekranem.
 * Ten guard jest jedynym miejscem, które decyduje, czy auth jest w ogóle dostępne.
 */

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Placeholdery z CI (patrz .github/workflows/ci.yml) nie są prawdziwą konfiguracją —
// build ma przechodzić, ale logowanie nie może próbować łączyć się z fikcyjnym hostem.
const PLACEHOLDER_HOST = "placeholder.supabase.co";

export function isSupabaseConfigured(): boolean {
  return Boolean(
    SUPABASE_URL &&
    SUPABASE_ANON_KEY &&
    !SUPABASE_URL.includes(PLACEHOLDER_HOST),
  );
}
