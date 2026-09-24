-- Les taules creades manualment des del SQL Editor no sempre hereten els
-- privilegis per defecte d'`anon`/`authenticated` que Supabase aplica a
-- les taules creades des del Table Editor. RLS només filtra files; sense
-- aquest GRANT previ, PostgREST respon "permission denied for table ...".

grant usage on schema public to anon, authenticated;

grant select on public.entries to anon, authenticated;
grant insert on public.entries to authenticated;

grant select on public.profiles to anon, authenticated;
