import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Next 16 zmienił nazwę konwencji „middleware" na „proxy" — plik i eksport
// muszą się nazywać `proxy`, zachowanie jest identyczne.
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Pomijamy zasoby statyczne i pliki z rozszerzeniem — proxy ma dotykać
  // wyłącznie nawigacji po stronach.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
