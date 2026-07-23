import { redirect } from "next/navigation";
import { BottomNav } from "@/components/bottom-nav";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

/**
 * Shell tras chronionych. Zabezpieczenie jest tu, a nie tylko w middleware,
 * jako druga linia obrony. W trybie demo (brak Supabase) chronionych tras nie
 * ma sensu pokazywać — odsyłamy na landing.
 */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isSupabaseConfigured()) {
    redirect("/");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-full flex-col">
      <div className="mx-auto w-full max-w-md flex-1 px-6 py-8">{children}</div>
      <BottomNav />
    </div>
  );
}
