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
-- 6. Estat de cada aplicació (ocult / editable / només consulta),
--    controlat exclusivament per l'administrador des de la pàgina d'inici.
-- ---------------------------------------------------------------------
create table if not exists public.app_settings (
  app_key    text primary key,
  status     text not null default 'EDITABLE' check (
    status in ('OCULT', 'EDITABLE', 'CONSULTA')
  ),
  updated_at timestamptz not null default now()
);

insert into public.app_settings (app_key, status) values
  ('linia-temps', 'EDITABLE'),
  ('definicions', 'EDITABLE')
on conflict (app_key) do nothing;

alter table public.app_settings enable row level security;

-- Tothom (fins i tot sense sessió) ha de poder saber quines apps es veuen.
drop policy if exists "L'estat de les aplicacions és consultable per tothom" on public.app_settings;
create policy "L'estat de les aplicacions és consultable per tothom"
  on public.app_settings for select
  using (true);

drop policy if exists "Només l'administrador pot canviar l'estat de les aplicacions" on public.app_settings;
create policy "Només l'administrador pot canviar l'estat de les aplicacions"
  on public.app_settings for update
  to authenticated
  using (auth.email() = 'jgallifa@umanresa.cat')
  with check (auth.email() = 'jgallifa@umanresa.cat');

-- ---------------------------------------------------------------------
-- 7. Anàlisi SAMR i STEEP: cada alumne analitza cada tecnologia
-- ---------------------------------------------------------------------
create table if not exists public.analyses (
  id             uuid primary key default gen_random_uuid(),
  entry_id       uuid not null references public.entries (id) on delete cascade,
  author_id      uuid not null references public.profiles (id) on delete cascade,
  samr_level     text not null check (
    samr_level in ('SUBSTITUCIO', 'AUGMENT', 'MODIFICACIO', 'REDEFINICIO')
  ),
  steep_social     text not null,
  steep_tecnologic text not null,
  steep_economic   text not null,
  steep_ecologic   text not null,
  steep_politic    text not null,
  created_at     timestamptz not null default now(),
  unique (entry_id, author_id)
);

create index if not exists analyses_entry_id_idx on public.analyses (entry_id);

alter table public.analyses enable row level security;

-- Cada alumne només veu la seva pròpia anàlisi; l'administrador les veu totes.
drop policy if exists "Veure l'anàlisi pròpia, o totes com a administrador" on public.analyses;
create policy "Veure l'anàlisi pròpia, o totes com a administrador"
  on public.analyses for select
  to authenticated
  using (
    auth.uid() = author_id
    or auth.email() = 'jgallifa@umanresa.cat'
  );

-- Només es pot afegir/editar la pròpia anàlisi, i únicament quan l'app
-- "línia de temps" no estigui en mode "només consulta" (llevat de
-- l'administrador, que sempre hi pot escriure).
drop policy if exists "Els usuaris autenticats poden afegir la seva anàlisi" on public.analyses;
create policy "Els usuaris autenticats poden afegir la seva anàlisi"
  on public.analyses for insert
  to authenticated
  with check (
    auth.uid() = author_id
    and (
      auth.email() = 'jgallifa@umanresa.cat'
      or (
        select status from public.app_settings where app_key = 'linia-temps'
      ) <> 'CONSULTA'
    )
  );

drop policy if exists "Els usuaris autenticats poden editar la seva anàlisi" on public.analyses;
create policy "Els usuaris autenticats poden editar la seva anàlisi"
  on public.analyses for update
  to authenticated
  using (auth.uid() = author_id)
  with check (
    auth.uid() = author_id
    and (
      auth.email() = 'jgallifa@umanresa.cat'
      or (
        select status from public.app_settings where app_key = 'linia-temps'
      ) <> 'CONSULTA'
    )
  );

-- ---------------------------------------------------------------------
-- 8. Definicions de tecnologia: definició pròpia inicial i posterior
--    a la lectura d'un document (una fila per alumne, també l'admin).
-- ---------------------------------------------------------------------
create table if not exists public.definitions (
  id                 uuid primary key default gen_random_uuid(),
  author_id          uuid not null unique references public.profiles (id) on delete cascade,
  initial_definition text,
  final_definition   text,
  created_at         timestamptz not null default now()
);

alter table public.definitions enable row level security;

-- Cada alumne només veu la seva pròpia definició, l'administrador les veu
-- totes, i quan l'app està en mode "només consulta" tothom veu les de
-- tothom (per posar en comú les respostes un cop tancada l'activitat).
drop policy if exists "Veure la definició pròpia, o totes com a administrador" on public.definitions;
create policy "Veure la definició pròpia, o totes com a administrador"
  on public.definitions for select
  to authenticated
  using (
    auth.uid() = author_id
    or auth.email() = 'jgallifa@umanresa.cat'
    or (
      select status from public.app_settings where app_key = 'definicions'
    ) = 'CONSULTA'
  );

-- Només es pot afegir/editar la pròpia definició, i únicament quan l'app
-- "definicions" no estigui en mode "només consulta" (llevat de
-- l'administrador, que sempre hi pot escriure).
drop policy if exists "Els usuaris autenticats poden afegir la seva definició" on public.definitions;
create policy "Els usuaris autenticats poden afegir la seva definició"
  on public.definitions for insert
  to authenticated
  with check (
    auth.uid() = author_id
    and (
      auth.email() = 'jgallifa@umanresa.cat'
      or (
        select status from public.app_settings where app_key = 'definicions'
      ) <> 'CONSULTA'
    )
  );

drop policy if exists "Els usuaris autenticats poden editar la seva definició" on public.definitions;
create policy "Els usuaris autenticats poden editar la seva definició"
  on public.definitions for update
  to authenticated
  using (auth.uid() = author_id)
  with check (
    auth.uid() = author_id
    and (
      auth.email() = 'jgallifa@umanresa.cat'
      or (
        select status from public.app_settings where app_key = 'definicions'
      ) <> 'CONSULTA'
    )
  );

-- ---------------------------------------------------------------------
-- 9. Privilegis a nivell de taula
--    (RLS només filtra files; sense aquests GRANT, PostgREST respon
--    "permission denied for table ...")
-- ---------------------------------------------------------------------
grant usage on schema public to anon, authenticated;

grant select                 on public.profiles to anon, authenticated;
grant select                         on public.entries to anon;
grant select, insert, update, delete on public.entries to authenticated;
grant select, insert, update         on public.analyses to authenticated;
grant select, insert, update         on public.definitions to authenticated;
grant select                 on public.app_settings to anon, authenticated;
grant update                         on public.app_settings to authenticated;

-- ---------------------------------------------------------------------
-- 10. Refresca la caché d'esquema de PostgREST
-- ---------------------------------------------------------------------
notify pgrst, 'reload schema';
