# Wobble — plan realizacji

Dokument planistyczny na podstawie `wieza_jenga_koncepcja1.pdf`.
Nazwa produktu: **Wobble** (zatwierdzona 2026-07-22).

---

## 0. Streszczenie w jednym akapicie

Web-app (Next.js na Vercel + Supabase) w formie PWA, mobile-first, w której lista zadań
na dany dzień jest renderowana jako wieża Jenga. Klocki fundamentowe (koralowe) leżą
u podstawy, opcjonalne (szare) wyżej. Wykonanie zadania = wyjęcie klocka. Wieczorem dzień
się „zamyka": wszystkie fundamenty zrobione → wieża stoi; choć jeden nie → animacja
zawalenia. Historia dni to „Muzeum wież" (kalendarz z miniaturkami), bez streaków i bez kar.

---

## 1. Decyzje produktowe (wynikające z PDF-a)

| Zagadnienie        | Decyzja                                                             | Uzasadnienie z koncepcji                      |
| ------------------ | ------------------------------------------------------------------- | --------------------------------------------- |
| Kategorie zadań    | Dokładnie 2: `foundation` / `optional`                              | trzeci poziom = tarcie decyzyjne              |
| Klasyfikacja       | zawsze ręczna; auto-sugestia dopiero po MVP i tylko jako podpowiedź | prokrastynator oszukuje się co do priorytetów |
| Kary               | brak jakichkolwiek poza animacją zawalenia                          | nie wzmacniać wewnętrznego krytyka            |
| Streak             | **nie ma** — zamiast tego Muzeum wież                               | zero po jednym złym dniu demotywuje           |
| Powrót po przerwie | zero komunikatów typu „straciłeś postęp"                            | niski koszt powrotu                           |
| Ton przypomnień    | rośnie **częstotliwość**, nie agresja                               | agresywny ton = odinstalowanie                |
| Model mentalny     | redukcja napięcia (rozbieranie), nie budowanie od zera              | pełna wieża zaprasza do działania             |

**Ryzyko #1 do pilnowania przez cały projekt:** metafora spowszednieje. Dlatego Muzeum
wież i skórki nie są „nice to have" — są częścią rdzenia i wchodzą już w fazie 2, nie „kiedyś".

---

## 2. Stack i infrastruktura

- **Next.js 15+** (App Router, TypeScript, Server Components + Server Actions)
- **Tailwind CSS v4** + design tokens (CSS variables) — jedno źródło kolorów/skórek
- **Motion** (dawniej Framer Motion) — animacje; `prefers-reduced-motion` obsłużone od startu
- **Supabase** — Postgres + Auth + RLS + Realtime (opcjonalnie) + `pg_cron` do przypomnień
- **Vercel** — hosting, preview deployments per PR, Vercel Cron do zamykania dni
- **GitHub Actions** — CI: typecheck, lint, testy, build; Vercel podpięty do repo (CD)
- **PWA**: manifest + service worker (`next-pwa` lub ręcznie) + Web Push dla przypomnień

### Auth

Supabase Auth przez `@supabase/ssr` (cookie-based, działa z SSR i Server Actions):

- e-mail + hasło **lub** magic link — rekomendacja: **magic link jako domyślny**, hasło opcjonalne
  (mniej tarcia, spójne z filozofią „niski próg wejścia"), plus reset hasła jeśli wchodzi hasło
- **Google OAuth** — konfiguracja w Google Cloud Console → Supabase Auth Providers
- Callback route `app/auth/callback/route.ts`, middleware odświeżające sesję
- Po pierwszym logowaniu: trigger DB tworzący wiersz w `profiles` (timezone, godzina zamknięcia dnia)

---

## 3. Model danych (Supabase / Postgres)

```
profiles
  id uuid PK -> auth.users
  display_name text
  timezone text            -- IANA, np. 'Europe/Warsaw'
  day_close_at time        -- domyślnie 22:00, użytkownik zmienia
  active_skin_id text
  reminders_enabled bool

towers                     -- jedna na użytkownika na dzień
  id uuid PK
  user_id uuid
  local_date date          -- data w strefie użytkownika, nie UTC
  status enum('open','standing','collapsed')
  closed_at timestamptz
  UNIQUE(user_id, local_date)

blocks                     -- zadania
  id uuid PK
  tower_id uuid
  title text
  kind enum('foundation','optional')
  position int             -- kolejność w wieży
  done_at timestamptz null
  required_focus_minutes int null   -- pomodoro-gate (faza 3)
  seed int                 -- do deterministycznego renderu (przechył, tekstura)

  carried_from_block_id uuid null   -- ślad przeniesienia z poprzedniego dnia
  deleted_at timestamptz null       -- soft delete, nigdy nie kasujemy twardo

block_events               -- dziennik dnia, źródło dla historii i undo
  id uuid PK
  tower_id uuid
  block_id uuid
  type enum('created','completed','uncompleted','edited','deleted','restored','carried')
  payload jsonb            -- stan przed zmianą, do odwrócenia
  created_at timestamptz
  undone_at timestamptz null

focus_sessions             -- faza 3
  id, block_id, started_at, ended_at, completed bool

skins / user_skins         -- faza 4, kosmetyka
push_subscriptions         -- endpoint, keys, user_id
```

**RLS włączone na wszystkim**, polityka `user_id = auth.uid()` (dla `blocks` przez join do `towers`).
Migracje w repo (`supabase/migrations`), aplikowane w CI.

### Kluczowa decyzja: czas i „zamknięcie dnia"

Strefa czasowa użytkownika jest źródłem prawdy dla `local_date`. Zamknięcie liczone
**dwutorowo**:

1. **Lazy** — przy każdym wejściu do apki domykamy wszystkie zaległe wieże (`status='open'`
   i `local_date < dziś`). To gwarantuje poprawność nawet gdy cron padnie.
2. **Cron** (Vercel Cron co 15 min) — domyka wieże tych, którzy nie weszli, i wysyła pusha
   z wynikiem dnia.

Animacja zawalenia odpala się przy **pierwszym zobaczeniu** wyniku, nie w momencie zapisu w DB —
inaczej użytkownik przegapiłby najmocniejszy moment emocjonalny produktu.

---

## 4. Ekrany

1. **Dziś** (ekran główny) — wieża + pole „dodaj zadanie" + toggle fundament/opcjonalne
2. **Dodawanie** — inline, bez modala: jedno pole + jeden tap na kategorię, Enter dodaje kolejne
3. **Zamknięcie dnia** — pełnoekranowa scena: stoi / zawala się + wieczorne pytanie
   „co jutro musi być fundamentem?" (opcjonalne, można pominąć jednym tapem)
4. **Muzeum wież** — kalendarz miesięczny, każdy dzień jako miniaturka SVG stanu wieży
5. **Ustawienia** — godzina zamknięcia, strefa, przypomnienia, skórka, konto
6. **Auth** — logowanie / rejestracja (email + Google)

Nawigacja mobilna: dolny bar 3 pozycje (Dziś / Muzeum / Ustawienia), thumb-reach,
safe-area-inset. Desktop: ten sam layout wyśrodkowany, wieża większa, kalendarz szerszy.

---

## 4a. Undo i historia dnia

**Decyzja: undo jest zawsze dostępne, dla całego bieżącego dnia — nie 5-sekundowy toast.**

Konsekwencje projektowe:

- **Nic nie jest kasowane twardo.** Ukończenie klocka to `done_at = now()`, usunięcie to
  `deleted_at = now()`. Każda zmiana dopisuje wiersz do `block_events`.
- **Dziennik dnia** — na ekranie „Dziś" wysuwany panel „co się dziś działo": lista zdarzeń
  w odwrotnej kolejności, przy każdym przycisk cofnięcia. Cofnięcie nie kasuje zdarzenia,
  tylko ustawia `undone_at` i dopisuje zdarzenie odwrotne — historia zostaje pełna i audytowalna.
- **Cofnięcie ukończenia = klocek wraca na swoje miejsce w wieży**, tą samą animacją puszczoną
  wstecz. To jest miły, satysfakcjonujący moment, wart osobnej dopieszczonej animacji —
  a nie techniczny „rollback".
- **Granica: zamknięcie dnia.** Po zamknięciu wieży historia staje się read-only, a stan dnia
  (`standing`/`collapsed`) jest ostateczny. Inaczej użytkownik mógłby cofnąć zawalenie,
  co kompletnie rozbraja mechanikę emocjonalną całego produktu.
- **Czemu bez toasta:** toast z timerem to presja czasu na ruchu, który i tak jest odwracalny.
  Stały dostęp do historii jest spokojniejszy i pasuje do „nie karać użytkownika".
  Toast zostaje tylko jako lekkie potwierdzenie („cofnij" bez odliczania).

Wchodzi w **fazie 2** — model zdarzeń musi powstać razem z rdzeniem, doklejanie go później
oznacza przepisanie wszystkich mutacji.

---

## 4b. Przenoszenie zadań na jutro

**Decyzja: nigdy automatycznie — zawsze jawny wybór użytkownika, per zadanie.**

Ekran zamknięcia dnia (po animacji stoi/zawalone) pokazuje listę niewykonanych klocków
z checkboxami:

- **nic nie jest zaznaczone domyślnie** — decyzja należy do użytkownika, zgodnie z zasadą
  z koncepcji, że automat nie decyduje za prokrastynatora
- **niewykonane fundamenty są na górze listy** i wizualnie wyróżnione — to jest ta „miękka
  sugestia", którą PDF dopuszcza: podpowiadamy uwagą, nie zaznaczeniem
- przy każdym zadaniu można od razu zmienić kategorię na jutro (fundament ↔ opcjonalne) —
  zadanie przeniesione nie musi zostać fundamentem
- skrót „przenieś wszystkie" i „nie przenoś nic", oba jednym tapem
- cały krok jest **pomijalny** — wyjście bez decyzji nie przenosi nic i nie generuje wyrzutów

Przeniesione zadanie tworzy nowy klocek w jutrzejszej wieży z `carried_from_block_id`.
Licznik przeniesień jest zapisywany, ale **nigdy nie pokazywany jako zarzut** („przenosisz to
już 5. raz"). Może się pojawić najwyżej jako neutralne pytanie: „to zadanie wraca od tygodnia —
podzielić je na mniejsze?".

Ten sam mechanizm obsługuje wieczorne pytanie „co jutro musi być fundamentem?" — to jeden
ekran, nie dwa.

---

## 5. Renderowanie wieży — decyzja techniczna

Trzy opcje rozważone:

| Opcja                      | Plus                                              | Minus                                               |
| -------------------------- | ------------------------------------------------- | --------------------------------------------------- |
| A. DOM + CSS/Motion        | dostępność, SEO, prostota, dobra wydajność mobile | zawalenie tylko „udawane"                           |
| B. Canvas 2D + `matter-js` | realistyczna fizyka zawalenia                     | ~40 kB, brak a11y, praca na dwóch modelach          |
| C. `three.js` / R3F 3D     | efekt „wow"                                       | ciężkie na mobile, długi czas dev, przesada dla MVP |

**Rekomendacja: A, z opcjonalnym doładowaniem B tylko na scenę zawalenia.**
Wieża w stanie normalnym to lista `<li>` z klockami — czytelna dla screen readerów,
klikalna, prosta w edycji. Klocki dostają deterministyczny mikro-przechył z `seed`,
przez co wieża wygląda „ręcznie ułożona", nie jak tabelka.
Scena zawalenia to osobny, **lazy-loadowany** komponent — na start keyframes per-klocek
(rotacja + spadek + odbicie, stagger od dołu). Jeśli po testach efekt będzie za słaby,
podmieniamy tylko ten jeden komponent na `matter-js`, bez ruszania reszty aplikacji.

### Animacje (lista docelowa)

- wejście wieży: stagger od dołu, spring
- wyjęcie klocka: wysunięcie w bok → fade → reszta wieży osiada w dół (to jest **główny
  moment satysfakcji w apce**, wart osobnej iteracji i haptics przez `navigator.vibrate`)
- próba wyjęcia zablokowanego klocka (pomodoro-gate): lekki „wobble", nie błąd
- zawalenie: 1.2–1.8 s, potem cisza i spokojny ekran — bez czerwieni, bez krzyku
- wieża stoi: subtelne „osiadanie" i delikatny glow, bez konfetti (PDF wprost: bez agresywnych nagród)
- `prefers-reduced-motion` → wszystkie powyższe degradują do crossfade

---

## 6. Fazy realizacji

**Faza 0 — fundament repo (0,5 dnia)**
Next.js + TS + Tailwind, ESLint/Prettier, Vitest, GitHub Actions (typecheck+lint+build),
projekt Supabase, projekt Vercel, preview deployments działają na PR.

**Faza 1 — auth + szkielet (1–2 dni)**
Supabase Auth (magic link + Google), middleware sesji, chronione trasy, `profiles`
z timezone, pusty layout z dolną nawigacją.

**Faza 2 — rdzeń: wieża dnia (3–5 dni)**
Migracje `towers`/`blocks` + RLS, dodawanie zadania (jedno pole + tap), render wieży,
wyjmowanie klocka z animacją i optimistic update, zamknięcie dnia (lazy + cron),
scena „stoi"/„zawalone". **To jest moment, w którym produkt ma sens — pierwsze realne testy.**

**Faza 3 — retencja (2–4 dni)**
Muzeum wież (kalendarz + miniaturki SVG), wieczorne pytanie „co jutro fundamentem?",
PWA + Web Push z eskalującą częstotliwością przypomnień.

**Faza 4 — anty-prokrastynacja i kosmetyka (2–4 dni)**
Pomodoro-gate na wybranych klockach, skórki wieży odblokowywane za konsekwentne dni,
miękka sugestia „to ma dziś deadline, może fundament?".

**Faza 5 — dopieszczenie**
Lighthouse ≥ 90 na mobile, a11y (kontrast, focus, screen reader), i18n PL/EN,
onboarding pierwszego dnia, testy e2e (Playwright) najważniejszej ścieżki.

---

## 7. CI/CD

```
PR  → GitHub Actions: typecheck, lint, unit, build
    → Vercel Preview Deployment (osobny branch Supabase lub wspólny dev-projekt)
main→ Vercel Production + migracje Supabase (supabase db push w job'ie)
```

Sekrety w GitHub Secrets i Vercel Env: `NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (tylko server),
`VAPID_*` dla push, `CRON_SECRET`.

---

## 8. Otwarte pytania (nie blokują startu, ale trzeba je rozstrzygnąć)

1. **Magic link czy hasło jako domyślna metoda e-mail?** Rekomendacja: magic link.
2. **Jaka godzina domyślnego zamknięcia dnia?** Rekomendacja: 22:00 lokalnie, edytowalna.
3. ~~Undo~~ — **rozstrzygnięte**, patrz sekcja 4a: pełna historia dnia, undo zawsze dostępne.
4. ~~Przenoszenie na jutro~~ — **rozstrzygnięte**, patrz sekcja 4b: jawny wybór per zadanie.
5. ~~Nazwa~~ — **rozstrzygnięte: Wobble.** „Jenga" nie pojawia się nigdzie w produkcie ani
   w kodzie (znak towarowy Hasbro) — metafora wieży z klocków zostaje, nazwa nie.
   Do sprawdzenia po Twojej stronie: dostępność domeny (`wobble.app` / `wobbly.app` /
   `getwobble.com` / `wobble.day`) i kolizje ze znakami towarowymi. Nie weryfikowałem tego.

**Copy wynikające z nazwy** (do użycia w UI): pusta wieża rano — „nothing to wobble yet";
animacja zablokowanego klocka nazywa się dosłownie _wobble_; Muzeum wież — „your wobbles".
