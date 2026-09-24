-- Època de la tecnologia (opcional)
create type era as enum (
  'PREHISTORIA',
  'EDAT_ANTIGA',
  'EDAT_MITJANA',
  'EDAT_MODERNA',
  'EDAT_CONTEMPORANIA'
);

-- Perfil públic mínim (l'esquema auth.* no és consultable directament
-- amb la clau anon/authenticated, així que en mantenim una còpia mínima
-- per poder mostrar l'autor de cada entrada).
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Els perfils són consultables per tothom"
  on public.profiles for select
  using (true);

-- Entrades de la línia de temps
create table public.entries (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  photo_url text not null,
  year integer not null,
  era era,
  author_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now()
);

create index entries_year_idx on public.entries (year);
create index entries_author_id_idx on public.entries (author_id);

alter table public.entries enable row level security;

create policy "Les entrades són consultables per tothom"
  on public.entries for select
  using (true);

create policy "Els usuaris autenticats poden afegir les seves entrades"
  on public.entries for insert
  to authenticated
  with check (auth.uid() = author_id);

-- En crear-se un usuari nou, en desem una còpia mínima a public.profiles
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Restringim el domini de correu permès per registrar-se/entrar.
-- Es dispara ABANS que el trigger anterior, així que si rebutja
-- la inserció, tampoc es crea el perfil.
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

create trigger restrict_email_domain_trigger
  before insert on auth.users
  for each row execute function public.restrict_email_domain();

-- Bucket públic per a les fotos de les entrades
insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do nothing;

create policy "Les fotos són consultables per tothom"
  on storage.objects for select
  using (bucket_id = 'photos');

create policy "Els usuaris autenticats poden pujar fotos"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'photos');

-- Privilegis a nivell de taula (RLS només filtra files; sense aquest
-- GRANT, PostgREST respon "permission denied for table ...").
grant usage on schema public to anon, authenticated;
grant select on public.entries to anon, authenticated;
grant insert on public.entries to authenticated;
grant select on public.profiles to anon, authenticated;
