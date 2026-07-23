-- Wobble — migracja 0001: profile użytkownika.
--
-- Jeden wiersz na użytkownika, tworzony automatycznie po rejestracji. Trzyma
-- ustawienia potrzebne od fazy 1 (strefa czasowa jest źródłem prawdy dla „dnia")
-- i pola pod kolejne fazy (godzina zamknięcia, skórka, przypomnienia).

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  timezone text not null default 'Europe/Warsaw',
  day_close_at time not null default '22:00',
  active_skin_id text not null default 'wood',
  reminders_enabled boolean not null default true,
  created_at timestamptz not null default now()
);

-- RLS: każdy widzi i edytuje wyłącznie swój profil.
alter table public.profiles enable row level security;

create policy "profil: odczyt własny"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profil: aktualizacja własna"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Profil zakłada trigger na auth.users — użytkownik nigdy nie wstawia go sam,
-- więc nie ma polityki INSERT (trigger działa jako definer, z pominięciem RLS).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
