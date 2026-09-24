-- L'època passa a ser obligatòria. Si ja hi ha entrades sense època
-- (creades abans d'aquest canvi), els assignem "Edat Contemporània" com a
-- valor provisional perquè es puguin corregir manualment després.
update public.entries set era = 'EDAT_CONTEMPORANIA' where era is null;

alter table public.entries alter column era set not null;
