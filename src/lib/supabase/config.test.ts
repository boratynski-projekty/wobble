import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const REAL = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL,
  key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
};

async function loadIsConfigured() {
  // config.ts czyta env na poziomie modułu, więc resetujemy cache między testami.
  vi.resetModules();
  const mod = await import("./config");
  return mod.isSupabaseConfigured();
}

describe("isSupabaseConfigured", () => {
  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = REAL.url;
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = REAL.key;
  });

  it("false, gdy brak zmiennych (tryb demo)", async () => {
    expect(await loadIsConfigured()).toBe(false);
  });

  it("false dla placeholdera z CI — build przechodzi, ale auth się nie łączy", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://placeholder.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "placeholder-anon-key";
    expect(await loadIsConfigured()).toBe(false);
  });

  it("true dla realnych kluczy", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://abcdef.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "eyJhbGci-realny-klucz";
    expect(await loadIsConfigured()).toBe(true);
  });
});
