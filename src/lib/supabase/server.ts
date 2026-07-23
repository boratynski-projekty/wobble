import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./config";

/**
 * Klient Supabase dla Server Components, Server Actions i Route Handlers.
 * Sesja żyje w cookie — dlatego czytamy i zapisujemy je przez next/headers.
 * W Next 16 cookies() jest asynchroniczne, stąd Promise w sygnaturze.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Wywołanie z Server Component — zapis cookie jest tam zabroniony.
          // Odświeżeniem sesji zajmuje się middleware, więc można to zignorować.
        }
      },
    },
  });
}
