# Deployment guide

A complete walkthrough, assuming you have never deployed a Next.js app before.
Every service here has a **permanent free tier** — not a trial. Notes on each
are in [Cost check](#cost-check-read-this-before-you-start).

**Total time:** about 30 minutes.

**What you need:** a GitHub account, this project on your computer, and Node.js
18 or newer (`node --version` to check).

---

## Cost check (read this before you start)

| Service | Plan | Card required? | Expires? |
| --- | --- | --- | --- |
| **TiDB Cloud** | Starter / Serverless | No | No — free forever |
| **Vercel** | Hobby | No | No — free forever |
| **Cloudinary** | Free | No | No — free forever |

Free-tier limits, which a portfolio site will not come close to:

- **TiDB Cloud Starter** — 25 GiB storage and 250 million Request Units per
  month, free forever. If you ever exceed it the cluster throttles; it does not
  bill you unless you explicitly add a card and enable spending.
- **Vercel Hobby** — 100 GB bandwidth/month, unlimited personal projects. For
  non-commercial use.
- **Cloudinary Free** — 25 monthly credits (~25 GB bandwidth). **Optional** —
  you can skip Cloudinary entirely and paste image URLs from anywhere.

> Deliberately **not** used: Railway, Render, Heroku, PlanetScale. Each either
> removed its free tier or only gives trial credits that run out.

---

## Part 1 — Create the free database (TiDB Cloud)

TiDB Cloud is MySQL-compatible, so the app talks to it with a standard MySQL
connection string.

1. Go to **<https://tidbcloud.com>** and click **Sign up**.
2. Sign up with Google or GitHub (fastest — no password to remember).
3. On the plan screen choose the free tier. Depending on when you read this it
   is labelled **Starter**, **Serverless**, or **Free**. It is the one that says
   **$0**. **Do not** pick Dedicated — that one costs money.
   - ✅ You should **not** be asked for a credit card. If a card is demanded,
     you picked the wrong plan — go back.
4. Give the cluster a name, e.g. `portfolio`. Leave the region on whatever is
   closest to you (for Malaysia, pick Singapore if offered).
5. Click **Create**. The cluster is ready in under a minute.
6. Open the cluster, then click the **Connect** button (top right).
7. In the dialog:
   - **Connect With:** choose **Prisma** if it is offered, otherwise
     **General** or **MySQL CLI**.
   - **Branch:** `main`.
   - Click **Generate password**. **Copy the password immediately** — it is
     shown only once. If you lose it, click **Reset password** and take the new
     one.
8. You now have these five pieces. Write them down:

   | Field | Looks like |
   | --- | --- |
   | Host | `gateway01.ap-southeast-1.prod.aws.tidbcloud.com` |
   | Port | `4000` |
   | User | `3xAbCdEfGh.root` |
   | Password | the one you just copied |
   | Database | `test` (the default) |

9. Assemble them into one connection string in this exact shape:

   ```
   mysql://USER:PASSWORD@HOST:4000/test?sslaccept=strict
   ```

   A filled-in example:

   ```
   mysql://3xAbCdEfGh.root:mY-p4ssw0rd@gateway01.ap-southeast-1.prod.aws.tidbcloud.com:4000/test?sslaccept=strict
   ```

   > **`?sslaccept=strict` is required.** TiDB refuses unencrypted connections
   > and you will get a TLS error without it.
   >
   > **If your password contains `@`, `:`, `/`, `#` or `?`**, it will break the
   > URL. Easiest fix: reset the password until you get one without those
   > characters. (Or percent-encode it: `@` → `%40`, `:` → `%3A`, `/` → `%2F`,
   > `#` → `%23`, `?` → `%3F`.)

Keep this string somewhere safe — you will paste it twice.

---

## Part 2 — Set up the project on your computer

1. Open a terminal in the project folder.

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create your local environment file by copying the template:

   ```bash
   cp .env.example .env      # Windows PowerShell: copy .env.example .env
   ```

4. Generate a session secret:

   ```bash
   npx auth secret
   ```

   This writes `AUTH_SECRET` into your `.env` automatically. If it doesn't,
   copy the value it prints and set it by hand.

5. Open `.env` and fill it in:

   ```ini
   DATABASE_URL="mysql://…your TiDB string from Part 1…?sslaccept=strict"
   AUTH_SECRET="…the generated secret…"
   NEXTAUTH_SECRET="…the same secret…"
   NEXTAUTH_URL="http://localhost:3000"

   ADMIN_USERNAME="admin"
   ADMIN_PASSWORD="pick-a-strong-password-here"
   ```

   > `ADMIN_USERNAME` / `ADMIN_PASSWORD` are only read by the seed script in the
   > next step. They create your login. Change the password from inside the
   > admin panel later.

   `.env` is git-ignored, so these secrets never reach GitHub.

---

## Part 3 — Create the tables and load your CV data

1. Create the database tables:

   ```bash
   npx prisma migrate dev --name init
   ```

   This creates a `prisma/migrations/` folder — **commit it**, it is part of
   your project.

   <details>
   <summary>If that command fails with a "shadow database" error</summary>

   `migrate dev` needs permission to create a temporary database. If TiDB
   refuses, use this instead — it pushes the schema directly and works fine for
   a single-owner site:

   ```bash
   npx prisma db push
   ```
   </details>

   <details>
   <summary>If it fails with a foreign key error</summary>

   Open `prisma/schema.prisma` and add `relationMode = "prisma"` to the
   datasource block:

   ```prisma
   datasource db {
     provider     = "mysql"
     url          = env("DATABASE_URL")
     relationMode = "prisma"
   }
   ```

   This makes Prisma manage relations in application code instead of relying on
   database foreign keys. Then run the command again.
   </details>

2. Load your CV data and create your admin account:

   ```bash
   npm run db:seed
   ```

   You should see a list of ✓ lines and your login details printed at the end.

   > Safe to re-run: the seed skips content that already exists, so it will
   > never wipe edits you made in the admin panel.

3. Start the site locally:

   ```bash
   npm run dev
   ```

4. Open **<http://localhost:3000>** — your portfolio, populated with your data.
   Then open **<http://localhost:3000/admin/login>** and sign in with the
   username and password from your `.env`.

Have a click around. Everything you see on the public site is editable from the
admin panel.

---

## Part 4 — Push the code to GitHub

1. Go to **<https://github.com/new>**.
2. Repository name: `portfolio`. Choose **Private** or **Public** — either
   works. **Do not** tick "Add a README" (the project already has one).
3. Click **Create repository**.
4. Back in your terminal, in the project folder:

   ```bash
   git init
   git add .
   git commit -m "Initial portfolio"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/portfolio.git
   git push -u origin main
   ```

   Replace `YOUR-USERNAME` with your GitHub username.

5. Refresh the GitHub page — your files should be there.

   ✅ **Check:** there is **no `.env` file** in the list. If you see one, stop
   and remove it (`git rm --cached .env`, commit, push) and reset your TiDB
   password.

---

## Part 5 — Deploy to Vercel

1. Go to **<https://vercel.com/signup>**.
2. Click **Continue with GitHub** and authorise Vercel.
3. Choose the **Hobby** plan — it is free forever and asks for no card.
4. On your dashboard click **Add New…** → **Project**.
5. Find your `portfolio` repository and click **Import**.
   - If it isn't listed, click **Adjust GitHub App Permissions** and grant
     access to the repo.
6. **Before clicking Deploy**, expand **Environment Variables** and add these
   three. Vercel detects Next.js and fills in the build settings itself — leave
   those alone.

   | Name | Value |
   | --- | --- |
   | `DATABASE_URL` | your full TiDB string, including `?sslaccept=strict` |
   | `AUTH_SECRET` | the same secret from your `.env` |
   | `NEXTAUTH_SECRET` | the same secret again |

   > Do **not** set `NEXTAUTH_URL` on Vercel — it is detected automatically.
   >
   > Do **not** add `ADMIN_USERNAME` / `ADMIN_PASSWORD` — those are only for the
   > seed script, which you already ran from your laptop. Your admin account is
   > already in the database.

7. Click **Deploy** and wait ~2 minutes.
8. When it finishes you get a URL like `portfolio-abc123.vercel.app`. Click it.

Your portfolio is live.

---

## Part 6 — Secure your admin account

1. Go to `https://your-site.vercel.app/admin/login`.
2. Sign in with the seeded username and password.
3. Click **Account** in the sidebar.
4. Set a **new strong password**, enter your current one to confirm, and save.
5. Optionally change the username away from `admin`.

Now edit anything — profile, projects, skills — and refresh the public site.
Changes appear immediately. **You never need to redeploy to change content.**

---

## Part 7 — Add a custom domain (optional)

### Using a domain you own

1. In Vercel, open your project → **Settings** → **Domains**.
2. Type your domain (e.g. `rashedur.dev`) and click **Add**.
3. Vercel shows the DNS records to create. At your domain registrar, add them:
   - Root domain (`rashedur.dev`) → an **A** record pointing at `76.76.21.21`
   - `www` → a **CNAME** record pointing at `cname.vercel-dns.com`
4. Wait for DNS to propagate (usually minutes, up to 24 hours). Vercel issues
   the HTTPS certificate automatically once it resolves.

### Free domain options

- Your `*.vercel.app` URL already works and is free forever.
- In Vercel → Settings → Domains you can rename it to any available
  `something.vercel.app`.
- Students: **GitHub Student Developer Pack** includes a free `.me` domain from
  Namecheap for a year.

---

## Updating the site later

**Content** (text, projects, skills, images) — edit in `/admin`. Live instantly.

**Code** (design, features) — commit and push:

```bash
git add .
git commit -m "Describe what changed"
git push
```

Vercel redeploys automatically within a couple of minutes.

**Schema** (adding a database field) — after editing `prisma/schema.prisma`:

```bash
npx prisma migrate dev --name describe-the-change
git add . && git commit -m "Add field" && git push
```

---

## Troubleshooting

**`Can't reach database server`**
Your `DATABASE_URL` is wrong or missing `?sslaccept=strict`. Re-check it, and
confirm the password has no `@ : / # ?` characters in it.

**`Error: connect ETIMEDOUT` on Vercel but fine locally**
Check the environment variable actually saved in Vercel → Settings →
Environment Variables. After changing one you must **redeploy** for it to take
effect (Deployments → ⋯ → Redeploy).

**Signed out immediately after signing in**
`AUTH_SECRET` differs between environments, or is missing on Vercel. Set it,
then redeploy.

**`/admin` shows a 500 after deploying**
You probably didn't run `npm run db:seed`, so there is no admin user. Run it
from your laptop — it talks to the same cloud database.

**Public site says "Nothing here yet"**
Same cause: the seed hasn't run, or it ran against a different database.

**Images don't show**
The URL must be a **direct link to the image file**, ending in `.jpg`, `.png`,
`.webp` etc. A Google Drive *share* page or an Imgur *album* page will not work
— you need the direct file URL.

**Build fails on Vercel with a Prisma error**
Confirm `DATABASE_URL` is set in Vercel. The build runs `prisma generate`,
which needs the variable present.

---

## Optional — Cloudinary for image hosting

You do not need this. Any public image URL works. But Cloudinary gives you a
permanent home for your images with a free-forever tier.

1. Sign up at **<https://cloudinary.com/users/register_free>** — no card
   required.
2. Go to **Media Library** and upload an image.
3. Click the image → **Copy URL**.
4. Paste that URL into any image field in the admin panel.

That's it — the app only ever stores the URL, never the file.
