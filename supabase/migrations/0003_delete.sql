-- Esborrat: cada usuari pot esborrar les seves pròpies entrades;
-- jgallifa@umanresa.cat pot esborrar qualsevol.

create policy "Esborrar entrada pròpia, o qualsevol com a administrador"
  on public.entries for delete
  to authenticated
  using (
    auth.uid() = author_id
    or auth.email() = 'jgallifa@umanresa.cat'
  );

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
