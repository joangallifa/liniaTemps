-- =====================================================================
--  Línia del temps tecnològica — esquema complet de Supabase
--
--  Idempotent: es pot executar tantes vegades com calgui al SQL Editor
--  sense provocar errors (tant en un projecte nou com en un d'existent).
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Tipus: època de la tecnologia
-- ---------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'era') then
    create type era as enum (
      'PREHISTORIA',
      'EDAT_ANTIGA',
      'EDAT_MITJANA',
      'EDAT_MODERNA',
      'EDAT_CONTEMPORANIA'
    );
  end if;
end $$;

-- ---------------------------------------------------------------------
-- 2. Taules
-- ---------------------------------------------------------------------

-- Perfil públic mínim (l'esquema auth.* no és consultable amb la clau
-- anon/authenticated; en mantenim una còpia per mostrar l'autor).
create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  email      text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.entries (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text not null,
  photo_url   text not null,
  photo_path  text,
  year        integer not null,
  era         era not null,
  author_id   uuid not null references public.profiles (id) on delete cascade,
  created_at  timestamptz not null default now()
);

-- Columnes afegides en versions posteriors (per a instal·lacions antigues)
alter table public.entries add column if not exists photo_path text;

-- L'època és obligatòria; les entrades antigues sense època reben un
-- valor provisional perquè es puguin corregir manualment.
update public.entries set era = 'EDAT_CONTEMPORANIA' where era is null;
alter table public.entries alter column era set not null;

create index if not exists entries_year_idx      on public.entries (year);
create index if not exists entries_author_id_idx on public.entries (author_id);

-- ---------------------------------------------------------------------
-- 3. Row Level Security
-- ---------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.entries  enable row level security;

drop policy if exists "Els perfils són consultables per tothom" on public.profiles;
create policy "Els perfils són consultables per tothom"
  on public.profiles for select
  using (true);

drop policy if exists "Les entrades són consultables per tothom" on public.entries;
create policy "Les entrades són consultables per tothom"
  on public.entries for select
  using (true);

drop policy if exists "Els usuaris autenticats poden afegir les seves entrades" on public.entries;
create policy "Els usuaris autenticats poden afegir les seves entrades"
  on public.entries for insert
  to authenticated
  with check (auth.uid() = author_id);

drop policy if exists "Actualitzar entrada pròpia, o qualsevol com a administrador" on public.entries;
create policy "Actualitzar entrada pròpia, o qualsevol com a administrador"
  on public.entries for update
  to authenticated
  using (
    auth.uid() = author_id
    or auth.email() = 'jgallifa@umanresa.cat'
  )
  with check (
    auth.uid() = author_id
    or auth.email() = 'jgallifa@umanresa.cat'
  );

drop policy if exists "Esborrar entrada pròpia, o qualsevol com a administrador" on public.entries;
create policy "Esborrar entrada pròpia, o qualsevol com a administrador"
  on public.entries for delete
  to authenticated
  using (
    auth.uid() = author_id
    or auth.email() = 'jgallifa@umanresa.cat'
  );

-- ---------------------------------------------------------------------
-- 4. Funcions i triggers sobre auth.users
-- ---------------------------------------------------------------------

-- Rebutja qualsevol registre amb un correu fora del domini permès.
-- És un trigger BEFORE: si rebutja, tampoc s'executa el següent.
create or replace function public.restrict_email_domain()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.email is null or new.email !~* '@umanresa\.cat$' then
    raise exception 'Només s''admeten comptes del domini @umanresa.cat';
  end if;
  return new;
end;
$$;

drop trigger if exists restrict_email_domain_trigger on auth.users;
create trigger restrict_email_domain_trigger
  before insert on auth.users
  for each row execute function public.restrict_email_domain();

-- En crear-se un usuari, en desem una còpia mínima a public.profiles.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------
-- 5. Storage: bucket públic per a les fotos
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do nothing;

drop policy if exists "Les fotos són consultables per tothom" on storage.objects;
create policy "Les fotos són consultables per tothom"
  on storage.objects for select
  using (bucket_id = 'photos');

drop policy if exists "Els usuaris autenticats poden pujar fotos" on storage.objects;
create policy "Els usuaris autenticats poden pujar fotos"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'photos');

drop policy if exists "Esborrar foto pròpia, o qualsevol com a administrador" on storage.objects;
create policy "Esborrar foto pròpia, o qualsevol com a administrador"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'photos'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or auth.email() = 'jgallifa@umanresa.cat'
    )
  );

-- ---------------------------------------------------------------------
-- 6. Privilegis a nivell de taula
--    (RLS només filtra files; sense aquests GRANT, PostgREST respon
--    "permission denied for table ...")
-- ---------------------------------------------------------------------
grant usage on schema public to anon, authenticated;

grant select                 on public.profiles to anon, authenticated;
grant select                         on public.entries to anon;
grant select, insert, update, delete on public.entries to authenticated;

-- ---------------------------------------------------------------------
-- 7. Refresca la caché d'esquema de PostgREST
-- ---------------------------------------------------------------------
notify pgrst, 'reload schema';
