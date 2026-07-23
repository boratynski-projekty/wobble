# Wobble — wdrożenie

Instrukcja od zera do działającego adresu w internecie.
Czas: ~30–40 min, z czego większość to klikanie w panelach.

> **Stan na teraz (faza 0):** kod nie łączy się jeszcze z Supabase ani z Google.
> Kroki 1–2 wystarczą, żeby aplikacja była online. Kroki 3–5 przygotowują konta
> pod fazę 1 (logowanie) — możesz je zrobić od razu albo później.

---

## 1. GitHub — wrzucenie kodu

Potrzebne: konto na github.com.

Załóż **puste** repozytorium (bez README, bez .gitignore) o nazwie `wobble`:
https://github.com/new — ustaw je jako **Private**.

Potem w katalogu projektu:

```bash
git add -A
```

```bash
git commit -m "Wobble: szkielet projektu (faza 0)"
```

```bash
git remote add origin https://github.com/TWOJA-NAZWA/wobble.git
```

```bash
git push -u origin main
```

Jeśli `git push` poprosi o hasło — GitHub nie przyjmuje już haseł. Zaloguj się przez
`gh auth login` (GitHub CLI) albo wygeneruj Personal Access Token w Settings →
Developer settings → Tokens.

**Sprawdzenie:** w repo na GitHubie w zakładce **Actions** powinien pojawić się
przebieg „CI" i po ~2 min zaświecić na zielono.

---

## 2. Vercel — hosting i CD

Potrzebne: konto na vercel.com (zaloguj się przez GitHub — to najprostsze).

1. **Add New → Project**
2. Wybierz repo `wobble` → **Import**
3. Vercel sam wykryje Next.js. Nic nie zmieniaj. → **Deploy**
4. Po ~2 min dostaniesz adres `wobble-xxx.vercel.app`

**Od tej chwili CD działa samo:**

- `git push` na `main` → deploy produkcyjny
- każdy Pull Request → osobny Preview Deployment z własnym linkiem

**Sprawdzenie:** otwórz adres na telefonie. Powinieneś zobaczyć wieżę z pięcioma
klockami — dwa dolne koralowe.

---

## 3. Supabase — baza i konta użytkowników

Potrzebne: konto na supabase.com (też można przez GitHub).

1. **New project** → nazwa `wobble`, region **Frankfurt (eu-central-1)**
2. Ustaw hasło do bazy i **zapisz je w menedżerze haseł** — nie da się go później podejrzeć
3. Poczekaj ~2 min na utworzenie projektu
4. Wejdź w **Project Settings → API** i skopiuj dwie wartości:
   - `Project URL`
   - `anon` `public` key

### Lokalnie

```bash
cp .env.example .env.local
```

Wklej obie wartości do `.env.local` przy `NEXT_PUBLIC_SUPABASE_URL`
i `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

> `.env.local` jest w `.gitignore` i **nigdy** nie trafia do repozytorium.
> Klucz `service_role` z tej samej strony to klucz omijający wszystkie zabezpieczenia —
> nie wklejaj go nigdzie po stronie przeglądarki i nie dawaj mu prefiksu `NEXT_PUBLIC_`.

### Na Vercelu

**Project Settings → Environment Variables** — dodaj te same dwie zmienne
i zaznacz wszystkie trzy środowiska (Production, Preview, Development).

---

## 4. Google — logowanie przez konto Google

Potrzebne: konto Google. To najbardziej upierdliwy krok, ale jednorazowy.

1. https://console.cloud.google.com → utwórz projekt `Wobble`
2. **APIs & Services → OAuth consent screen** → typ **External** → wypełnij nazwę
   aplikacji i swój e-mail kontaktowy
3. **Credentials → Create Credentials → OAuth client ID** → typ **Web application**
4. W polu **Authorized redirect URIs** wklej adres z panelu Supabase
   (Authentication → Providers → Google — Supabase pokazuje tam gotowy URI
   w formacie `https://TWOJ-PROJEKT.supabase.co/auth/v1/callback`)
5. Skopiuj `Client ID` i `Client Secret`
6. Wróć do Supabase → **Authentication → Providers → Google** → włącz, wklej oba pola, zapisz

---

## 5. Adresy zwrotne w Supabase

**Authentication → URL Configuration:**

- **Site URL:** `https://wobble-xxx.vercel.app` (Twój adres produkcyjny)
- **Redirect URLs:** dodaj dwa wpisy:
  - `http://localhost:3000/**`
  - `https://wobble-*.vercel.app/**` (gwiazdka obejmuje adresy Preview z PR-ów)

Bez tego kroku logowanie zadziała lokalnie, a na produkcji będzie odbijać z błędem.

---

## Codzienna praca — jak wygląda deploy po konfiguracji

```bash
git checkout -b nazwa-zmiany
```

Zrób zmiany, potem:

```bash
git add -A && git commit -m "opis zmiany" && git push -u origin nazwa-zmiany
```

Otwórz Pull Request na GitHubie. Dostaniesz:

- zielone/czerwone CI (format, lint, typy, testy, build)
- link do Preview Deployment — **klikalna wersja zmiany, do sprawdzenia na telefonie
  przed wrzuceniem na produkcję**

Merge do `main` → automatyczny deploy produkcyjny.

---

## Co jeszcze przed nami (nie teraz)

- **Migracje bazy** — pojawią się w `supabase/migrations` w fazie 2, wtedy dojdzie
  krok aplikowania ich w CI
- **Vercel Cron** — zamykanie dnia o ustalonej godzinie, faza 2
- **Web Push** — klucze VAPID (`npx web-push generate-vapid-keys`), faza 3
- **Własna domena** — Vercel → Settings → Domains, po wykupieniu adresu

---

## Gdy coś nie działa

| Objaw                                  | Przyczyna                                                                      |
| -------------------------------------- | ------------------------------------------------------------------------------ |
| Build na Vercelu pada, lokalnie działa | brakuje zmiennej środowiskowej w Vercel Env                                    |
| Logowanie odbija z błędem redirect     | adres nie dodany w Supabase → URL Configuration (krok 5)                       |
| CI czerwone na `format:check`          | uruchom `npm run format` i zacommituj                                          |
| Zmiany nie pojawiają się na produkcji  | sprawdź, czy push poszedł na `main` i czy deploy nie stoi na błędzie w Vercelu |
