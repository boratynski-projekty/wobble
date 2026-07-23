import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  SUPABASE_ANON_KEY,
  SUPABASE_URL,
  isSupabaseConfigured,
} from "./config";

/** Trasy dostępne bez logowania. Reszta grupy (app) wymaga sesji. */
const PUBLIC_PATHS = ["/", "/login", "/auth"];

function isPublic(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

/**
 * Odświeża sesję Supabase przy każdym żądaniu i przekierowuje niezalogowanych
 * z tras chronionych na /login. Gdy Supabase nie jest skonfigurowane (tryb demo),
 * przepuszcza wszystko bez zmian — patrz config.ts.
 */
export async function updateSession(
  request: NextRequest,
): Promise<NextResponse> {
  if (!isSupabaseConfigured()) {
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  // Uwaga: getUser() musi zostać wywołane, żeby token się odświeżył — bez tego
  // sesja wygasa mimo obecności cookie.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && !isPublic(request.nextUrl.pathname)) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    // Zapamiętujemy dokąd użytkownik chciał trafić, żeby wrócić tam po zalogowaniu.
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}
