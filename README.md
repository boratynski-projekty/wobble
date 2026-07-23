# Wobble

Planner dzienny dla osób, które odkładają na później. Zamiast listy TODO zadania są
klockami w chwiejnej wieży: fundamenty (koralowe) u podstawy, opcjonalne (drewniana
szarość) wyżej. Dzień zaczyna się od pełnej wieży i jest stopniowo rozbierany. Jeśli
wieczorem choć jeden fundament został niewykonany — wieża się zawala.

- **Koncepcja produktowa i decyzje projektowe:** [PLAN.md](./PLAN.md)
- **Brief dla designera (PL + EN):** [DESIGN-PROMPT.md](./DESIGN-PROMPT.md)
- **Wdrożenie krok po kroku:** [DEPLOY.md](./DEPLOY.md)

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · Motion · Supabase (Postgres,
Auth, RLS) · Vercel · GitHub Actions

## Start

```bash
npm install
cp .env.example .env.local   # uzupełnij kluczami Supabase
npm run dev
```

## Skrypty

| Komenda                | Do czego                              |
| ---------------------- | ------------------------------------- |
| `npm run dev`          | serwer deweloperski na :3000          |
| `npm run build`        | build produkcyjny                     |
| `npm test`             | testy jednostkowe (Vitest)            |
| `npm run typecheck`    | `tsc --noEmit`                        |
| `npm run lint`         | ESLint                                |
| `npm run format`       | Prettier — zapis                      |
| `npm run format:check` | Prettier — weryfikacja (używane w CI) |

## Status

**Faza 0 — szkielet.** Działa: projekt Next.js, design tokens light/dark, deterministyczny
przechył klocków (`src/lib/tilt.ts`) z testami, pipeline CI. Strona główna to statyczny
podgląd wieży, bez logiki. Kolejne fazy — zob. [PLAN.md](./PLAN.md) sekcja 6.
