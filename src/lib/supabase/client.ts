import { createBrowserClient } from "@supabase/ssr";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./config";

/**
 * Klient Supabase dla komponentów działających w przeglądarce (client components).
 * Wołany tylko z miejsc, które wcześniej sprawdziły isSupabaseConfigured(), więc
 * zakładamy tu obecność zmiennych.
 */
export function createClient() {
  return createBrowserClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);
}
