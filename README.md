# Línia del temps tecnològica

Aplicació web perquè l'alumnat construeixi col·laborativament una línia de
temps de tecnologies al llarg de la història. Cada entrada té una foto, un
títol, una descripció, un any (i opcionalment una època), i mostra qui l'ha
afegit. Només es pot entrar amb un correu **@umanresa.cat**, mitjançant un
enllaç d'accés (magic link) enviat per correu.

## Stack

- [Next.js 15](https://nextjs.org/) (App Router) + TypeScript + Tailwind CSS
- [Prisma](https://www.prisma.io/) + Postgres (pensat per a Vercel Postgres / Neon)
- [Auth.js (NextAuth v5)](https://authjs.dev/) amb magic link via [Resend](https://resend.com/)
- [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) per emmagatzemar les fotos

Tot desplegable des de Vercel; l'únic servei extern necessari és Resend
(gratuït) per poder enviar els correus del magic link.

## Configuració pas a pas

### 1. Base de dades — Vercel Postgres

1. Al dashboard del projecte a Vercel, ves a **Storage → Create Database →
   Postgres** (proveïdor Neon).
2. Connecta-la al projecte. Vercel injectarà automàticament les variables
   d'entorn de connexió.
3. Aquest projecte espera dues variables concretes: `POSTGRES_PRISMA_URL`
   (connexió amb pooling) i `POSTGRES_URL_NON_POOLING` (connexió directa,
   usada per les migracions). Si Vercel les anomena diferent (per exemple
   `DATABASE_URL` / `DATABASE_URL_UNPOOLED`), crea dues variables noves amb
   aquests noms exactes apuntant als mateixos valors, o bé actualitza
   `prisma/schema.prisma` perquè faci servir els noms que Vercel t'hagi
   donat.
4. Un cop hi hagi connexió, aplica el schema a la base de dades:
   ```bash
   npx prisma db push
   ```

### 2. Fotos — Vercel Blob

1. **Storage → Create Database → Blob**.
2. Connecta-la al projecte; injectarà `BLOB_READ_WRITE_TOKEN` automàticament.

### 3. Enviament del magic link — Resend

1. Crea un compte a [resend.com](https://resend.com).
2. Verifica un domini propi (recomanat) o, per fer proves ràpides, fes
   servir l'adreça de prova `onboarding@resend.dev` que Resend proporciona
   sense verificació.
3. Genera una API key i posa-la a la variable `AUTH_RESEND_KEY`.
4. Defineix `EMAIL_FROM` amb l'adreça remitent (ha de pertànyer al domini
   verificat).

### 4. Autenticació

1. Genera un secret per Auth.js:
   ```bash
   npx auth secret
   ```
   Copia el valor generat a la variable `AUTH_SECRET`.
2. `ALLOWED_EMAIL_DOMAIN` ja ve per defecte a `umanresa.cat`; només cal
   canviar-la si mai vols restringir a un altre domini.

### 5. Variables d'entorn

Copia `.env.example` a `.env` en local i omple els valors. A Vercel,
defineix-les a **Project Settings → Environment Variables** (les de la base
de dades i el blob ja hi apareixeran soles si has connectat els stores des
del pas 1 i 2).

## Desenvolupament local

```bash
npm install
npx prisma db push
npm run dev
```

L'aplicació queda disponible a http://localhost:3000.

## Desplegament a Vercel

1. Puja aquest projecte a un repositori de GitHub.
2. A [vercel.com/new](https://vercel.com/new), importa el repositori.
3. Connecta els stores de Postgres i Blob (o defineix les variables d'entorn
   manualment com s'explica més amunt).
4. Desplega. Un cop desplegat (o abans, en local apuntant a la base de dades
   de producció), aplica el schema:
   ```bash
   npx prisma db push
   ```

## Model de dades

- **User**: creat automàticament per Auth.js en iniciar sessió amb el
  magic link.
- **Entry**: `title`, `description`, `photoUrl`, `year` (enter; negatiu per
  a.C.), `era` (opcional: Prehistòria, Edat Antiga, Edat Mitjana, Edat
  Moderna, Edat Contemporània), `author`.

## Límits a tenir en compte

- Les fotos es limiten a 4 MB (límit habitual del cos de les Serverless
  Functions de Vercel al pla Hobby).
- Qualsevol correu fora del domini configurat (`umanresa.cat`) és rebutjat
  en el moment d'enviar el magic link.
