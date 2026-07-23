-- Wobble — migracja 0002: rdzeń wieży.
--
-- Jedna wieża na użytkownika na dzień (local_date w strefie użytkownika, nie UTC).
-- Klocki = zadania. Każda mutacja klocka dopisuje wiersz do block_events — to jest
-- źródło prawdy dla historii dnia i cofania (PLAN.md 4a). Nic nie kasujemy twardo.

-- Enumy (idempotentnie — migracja może być odtwarzana na świeżej bazie).
do $$ begin
  create type tower_status as enum ('open', 'standing', 'collapsed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type block_kind as enum ('foundation', 'optional');
exception when duplicate_object then null; end $$;

do $$ begin
  create type block_event_type as enum (
    'created', 'completed', 'uncompleted', 'edited', 'deleted', 'restored', 'carried'
  );
exception when duplicate_object then null; end $$;

-- ── Wieże ──────────────────────────────────────────────────────────────────
create table if not exists public.towers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  local_date date not null,
  status tower_status not null default 'open',
  closed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, local_date)
);

create index if not exists towers_user_date_idx
  on public.towers (user_id, local_date desc);

-- ── Klocki (zadania) ───────────────────────────────────────────────────────
create table if not exists public.blocks (
  id uuid primary key default gen_random_uuid(),
  tower_id uuid not null references public.towers (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 200),
  kind block_kind not null default 'optional',
  position integer not null default 0,
  done_at timestamptz,
  deleted_at timestamptz,
  required_focus_minutes integer,
  carried_from_block_id uuid references public.blocks (id) on delete set null,
  -- Deterministyczny render (przechył, tekstura) — zob. src/lib/tilt.ts.
  seed integer not null default floor(random() * 1000000),
  created_at timestamptz not null default now()
);

create index if not exists blocks_tower_idx on public.blocks (tower_id);

-- ── Dziennik zdarzeń ───────────────────────────────────────────────────────
create table if not exists public.block_events (
  id uuid primary key default gen_random_uuid(),
  tower_id uuid not null references public.towers (id) on delete cascade,
  block_id uuid references public.blocks (id) on delete set null,
  type block_event_type not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  undone_at timestamptz
);

create index if not exists block_events_tower_idx
  on public.block_events (tower_id, created_at desc);

-- ── RLS ─────────────────────────────────────────────────────────────────────
alter table public.towers enable row level security;
alter table public.blocks enable row level security;
alter table public.block_events enable row level security;

-- Polityki tworzymy idempotentnie — ponowne wklejenie migracji nie może wywalić błędu.
drop policy if exists "wieze: wlasne" on public.towers;
drop policy if exists "klocki: przez wieze" on public.blocks;
drop policy if exists "zdarzenia: przez wieze" on public.block_events;

-- Wieże: pełny dostęp tylko do własnych.
create policy "wieze: wlasne" on public.towers
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Klocki i zdarzenia: własność liczona przez wieżę-rodzica.
create policy "klocki: przez wieze" on public.blocks
  for all
  using (exists (
    select 1 from public.towers t
    where t.id = blocks.tower_id and t.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.towers t
    where t.id = blocks.tower_id and t.user_id = auth.uid()
  ));

create policy "zdarzenia: przez wieze" on public.block_events
  for all
  using (exists (
    select 1 from public.towers t
    where t.id = block_events.tower_id and t.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.towers t
    where t.id = block_events.tower_id and t.user_id = auth.uid()
  ));
