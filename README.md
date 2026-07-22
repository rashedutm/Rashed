# Portfolio — Netflix-style, fully database-driven

A personal portfolio that presents projects as browsable "posters" in horizontal
shelves, with a full admin panel behind a login.

**Nothing is hardcoded.** Name, bio, contact details, skills, experience,
projects, awards and education all live in the database and are edited from
`/admin`. Content changes appear on the public site immediately — no redeploy.

> **Deploying for the first time?** Follow [DEPLOYMENT.md](./DEPLOYMENT.md)
> instead — it is a click-by-click guide that assumes no prior experience.

---

## Stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router) + React 19 + TypeScript |
| Styling | Tailwind CSS v4 with CSS-variable design tokens |
| Database | MySQL — TiDB Cloud Serverless (any MySQL 8 host works) |
| ORM | Prisma 6 |
| Auth | Auth.js (NextAuth v5), credentials provider, bcrypt hashes |
| Validation | Zod, on every server action |
| Motion | Framer Motion |
| Hosting | Vercel |

Every service used has a permanent free tier.

---

## Local development

**Prerequisites:** Node.js 18+ and a MySQL database. The quickest free option is
a [TiDB Cloud Starter](https://tidbcloud.com) cluster — see
[DEPLOYMENT.md Part 1](./DEPLOYMENT.md#part-1--create-the-free-database-tidb-cloud).

```bash
# 1. Install dependencies
npm install

# 2. Create your env file
cp .env.example .env

# 3. Generate a session secret (writes AUTH_SECRET into .env)
npx auth secret

# 4. Put your MySQL connection string into DATABASE_URL in .env,
#    and set ADMIN_USERNAME / ADMIN_PASSWORD for the seed.

# 5. Create the tables
npx prisma migrate dev --name init

# 6. Load the CV data and create the admin account
npm run db:seed

# 7. Run it
npm run dev
```

- Public site → <http://localhost:3000>
- Admin → <http://localhost:3000/admin/login>

### Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build (runs `prisma generate` first) |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run db:migrate` | Create and apply a migration (`prisma migrate dev`) |
| `npm run db:deploy` | Apply existing migrations (`prisma migrate deploy`) |
| `npm run db:push` | Sync schema without migration files |
| `npm run db:seed` | Seed CV data + admin user |
| `npm run db:studio` | Browse the database in Prisma Studio |

---

## Project structure

```
prisma/
  schema.prisma        Models — standard MySQL only, no TiDB-specific features
  seed.ts              Admin user + real CV data
src/
  app/
    page.tsx           Home: hero, shelves, about, skills, experience, awards
    project/[slug]/    Project detail page
    admin/
      login/           Sign-in (outside the guarded layout)
      (dashboard)/     Every guarded admin screen
    api/auth/          Auth.js route handler
  actions/             Server actions — one file per content type
  components/
    site/              Public UI
    admin/             Admin forms and CRUD shells
  lib/
    prisma.ts          Prisma singleton
    auth.ts            Auth.js + requireAdmin()
    auth.config.ts     Edge-safe half, imported by the proxy
    data.ts            Public read queries (published content only)
    validation.ts      Zod schemas
  proxy.ts             Route guard for /admin/*
```

---

## How the content model works

**Shelves are generated from data.** Each project has a `category` field, and
every distinct category becomes one horizontal row on the home page. Add a
project with a new category and a new row appears — nothing to change in code.
Projects marked `featured` also appear in a "Featured" row at the top.

**Drafts stay private.** A project with `status: draft` is invisible on the
public site; every public query filters on `status: published`.

**Ordering.** Every model has `sortOrder` — lower numbers come first. Skill
categories are ordered by the lowest `sortOrder` within them.

**Media is never uploaded here.** Only URLs are stored. Cloudinary, YouTube, or
any public image URL works. Projects without a thumbnail render a generated
gradient poster derived from the slug, so the grid never looks broken.

---

## Security

- **Route guard** — `src/proxy.ts` blocks `/admin/*` for signed-out visitors;
  the dashboard layout re-checks the session as a second layer.
- **Every server action** calls `requireAdmin()` before touching the database.
- **Passwords** are bcrypt hashed (cost 12). The login compares against a dummy
  hash when the user doesn't exist, so response timing doesn't leak valid
  usernames.
- **All input is Zod-validated** server-side.
- **URLs are protocol-checked** on write *and* on render — only `http:` and
  `https:` are ever emitted into `href`/`src`, so a stored `javascript:` URL
  cannot execute.
- **No raw SQL** — every query goes through Prisma, so values are parameterised.
- **Server actions** carry Next.js's built-in origin checks, covering CSRF.
- **Secrets** live in environment variables; `.env` is git-ignored.

---

## Notes and trade-offs

- **Dates are stored as strings** (`"Jun 2025"`, `"Present"`). CV dates are
  month-granularity and often approximate, so strings keep the admin forms
  simple and avoid timezone bugs. The `current` boolean drives "Present".
- **`bcryptjs`, not `bcrypt`.** Pure JavaScript, so there is no native module to
  compile — it installs cleanly on Vercel and on Windows.
- **Public pages are `force-dynamic`.** Every request reads the database, which
  is what makes admin edits appear instantly. Server actions also call
  `revalidatePath` so any future caching stays correct.
- **`next/image` is not used for admin-supplied URLs.** Those can point at any
  host, and `next/image` requires each host to be allow-listed in config —
  which would mean editing code to add an image, defeating the point.
