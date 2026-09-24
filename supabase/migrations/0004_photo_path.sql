-- Guardem també el path intern de l'storage (no només la URL pública)
-- perquè, en esborrar una entrada, també es pugui esborrar el fitxer.
alter table public.entries add column photo_path text;
