# Prompt dla designera / narzędzia AI (Figma Make, v0, Lovable, Midjourney do moodboardu)

Wklej poniższy tekst w całości. Wersja PL — poniżej wersja EN do narzędzi anglojęzycznych.

---

## PL

Zaprojektuj **Wobble** — mobile-first aplikację webową, planner dzienny dla osób, które
prokrastynują. Zamiast listy TODO zadania są klockami w chwiejnej wieży z klocków.

Nazwa „Wobble" (chwianie się) ma wracać w warstwie wizualnej: wieża nigdy nie stoi idealnie
prosto, zawsze jest w niej lekkie napięcie i niepewność. To ma być urocze i trochę zabawne,
nie stresujące.

**Rdzeń metafory:** dzień zaczyna się od PEŁNEJ wieży i jest stopniowo ROZBIERANY.
Klocki fundamentowe (koralowe) leżą u samej podstawy — jeśli choć jeden nie zostanie
wyjęty do końca dnia, wieża się wieczorem zawala. Klocki opcjonalne (szare, wyżej) nie
mają takiej konsekwencji.

**Ton wizualny:** ciepły, spokojny, dorosły. Zero infantylnej gamifikacji, zero konfetti,
zero czerwonych alertów, zero agresywnych badge'y i streaków. Aplikacja ma nie wzmacniać
wewnętrznego krytyka użytkownika. Bliżej „ciepłego, dobrze zaprojektowanego narzędzia"
niż „gry mobilnej". Inspiracje nastrojem: Things 3, Bear, Arc — ale z jednym mocnym,
fizycznym obiektem w centrum ekranu.

**Paleta:** tło jasny piaskowy / off-white (i pełny wariant dark: ciepły grafit, nie zimny
granat). Fundamenty: koralowy. Opcjonalne: ciepła szarość drewna. Akcenty minimalne.
Klocki mają teksturę drewna/betonu — mają wyglądać jak przedmiot fizyczny, mieć głębię,
miękki cień i lekki, nierówny przechył, jakby ułożył je człowiek. Nie mogą wyglądać jak
prostokąty w tabeli.

**Typografia:** jeden krój, geometryczny grotesk, duże czytelne tytuły, tekst na klocku
jednolinijkowy z eleganckim skróceniem.

**Ekrany do zaprojektowania (375×812 mobile, plus wariant desktop 1280 dla 1 i 4):**

1. **Dziś** — wieża w centrum ekranu jako główny bohater. Fundamenty wyraźnie na dole.
   Pod wieżą jedno pole „dodaj zadanie" i dwa tapy kategorii. Dolna nawigacja 3 pozycje.
   Pokaż trzy stany: wieża pełna (rano), wieża w połowie rozebrana, wieża prawie pusta.
2. **Zamknięcie dnia — sukces** — pełny ekran, wieża stoi, spokojna satysfakcja,
   subtelne światło. Bez fajerwerków.
3. **Zamknięcie dnia — porażka** — klatka kluczowa animacji zawalenia. Ma być mocna
   emocjonalnie, ale nie karząca: bez czerwieni, bez ostrzegawczych ikon, bez tekstu
   obwiniającego. Kurz, rozsypane klocki, cisza.
4. **Muzeum wież** — kalendarz miesięczny, każdy dzień to mała ikonka-miniaturka wieży
   w jednym z trzech stanów: stoi / częściowo rozebrana / zawalona. Ma wyglądać jak
   kolekcja, coś, do czego się wraca.
5. **Logowanie** — e-mail i „kontynuuj z Google", maksymalnie prosto, jedna wieża w tle.
6. **Ustawienia** — godzina zamknięcia dnia, przypomnienia, skórka wieży, konto.

**Dodatkowo poproszę o:**

- Design tokens (kolory light/dark, spacing, radius, cienie, typografia) jako zmienne
- Trzy warianty skórki klocka do odblokowania (np. drewno / beton / szkło)
- Opis 5 kluczowych animacji: wejście wieży, wyjęcie klocka + osiadanie reszty, zablokowany
  klocek, zawalenie, stan „stoi". Podaj timing i easing.

**Wymagania techniczne:** wszystko musi działać w Tailwind CSS + Motion (Framer Motion),
mieć wersję dark, respektować `prefers-reduced-motion`, kontrast min. AA, obszary dotykowe
min. 44 px, safe-area na iOS.

---

## EN

Design **Wobble** — a mobile-first web app, a daily planner for people who procrastinate,
where tasks are rendered as blocks in a wobbly stacked tower instead of a todo list.

The name should echo in the visuals: the tower never stands perfectly straight, there is
always a little tension and uncertainty in it. This should read as charming and slightly
funny, not stressful.

Core metaphor: the day starts with a FULL tower that gets progressively DISMANTLED.
Foundation blocks (coral) sit at the very bottom — if even one is left undone by end of
day, the tower collapses in the evening. Optional blocks (warm grey, higher up) carry no
such consequence.

Visual tone: warm, calm, adult. No childish gamification, no confetti, no red alerts, no
aggressive badges or streaks. The app must not reinforce the user's inner critic. Closer
to a well-crafted tool (Things 3, Bear, Arc) than to a mobile game — but with one strong
physical object at the center of the screen.

Palette: light sand / off-white background, plus a full dark variant (warm charcoal, not
cold navy). Foundations: coral. Optional: warm wood grey. Blocks should have wood/concrete
texture, real depth, soft shadows and a slight uneven tilt, as if stacked by hand — never
flat table rectangles.

Screens (375×812 mobile, plus 1280 desktop for 1 and 4):

1. Today — tower as the hero, foundations clearly at the base, one "add task" field and two
   category taps below, 3-item bottom nav. Show three states: full, half-dismantled, nearly empty.
2. Day close — success: full-screen, tower standing, quiet satisfaction, no fireworks.
3. Day close — collapse: key frame of the collapse animation. Emotionally strong but not
   punishing: no red, no warning icons, no blaming copy. Dust, scattered blocks, silence.
4. Tower museum — month calendar, each day a small tower thumbnail in one of three states:
   standing / partially dismantled / collapsed. Should feel like a collection worth revisiting.
5. Sign in — email plus "continue with Google", minimal, one tower in the background.
6. Settings — day close time, reminders, tower skin, account.

Also deliver: design tokens (light/dark colors, spacing, radii, shadows, type) as variables;
three unlockable block skins (wood / concrete / glass); and a spec of 5 key animations —
tower entrance, block removal + settling, locked block, collapse, standing state — with
timing and easing.

Technical constraints: must be buildable in Tailwind CSS + Motion (Framer Motion), full dark
mode, respect `prefers-reduced-motion`, min AA contrast, 44 px touch targets, iOS safe areas.
