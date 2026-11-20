# Deploying Proxima Elec on Vercel (home page + admin panel)

The storefront (`/`), the full catalog page (`/products`) and the admin panel
(`/admin`) are **one single Next.js app** — deploying the project on Vercel
automatically publishes all of them. No extra setup, no second deployment.

The store now speaks **three languages** (English / Français / العربية with
full right-to-left support) — visitors switch from the header, and you edit
the FR/AR texts from Admin → Content → "French & Arabic translations".
Product photos can be **uploaded directly from your device** (no links
needed) — they are compressed and stored in the database automatically.

This guide takes ~15 minutes. You need: a GitHub account, a Vercel account
(free tier is fine), and a free Postgres database (recommended: [Neon](https://neon.tech)).

---

## Why Postgres?

The project ships with a local **SQLite** file (`db/custom.db`) which is perfect
for development. Vercel's serverless filesystem is **read-only/ephemeral**, so a
SQLite file there would lose data. The recommended (and easiest) path is a free
hosted Postgres — the switch is a single line in `prisma/schema.prisma`.

---

## Using Windows? (one-time setup, ~2 minutes)

All the commands in this guide work in **PowerShell** after two free installs:

1. **Bun** (runs the install + database scripts). In PowerShell:
   ```powershell
   powershell -c "irm bun.sh/install.ps1 | iex"
   ```
   Then **close PowerShell and open a new window** (the PATH only refreshes in
   new terminals) and verify:
   ```powershell
   bun --version
   ```
   If it still says "not recognized", either reopen the terminal or add
   `C:\Users\<you>\.bun\bin` to your PATH manually.
   (No luck? Download the Windows zip from [bun.sh](https://bun.sh).)

2. **Git** (pushes the code to GitHub). Check with `git --version`; if it is not
   recognized, install it from
   [git-scm.com/download/win](https://git-scm.com/download/win).
   When you `git push` for the first time, Git for Windows opens a browser
   window to sign in to your GitHub account — that is normal.

One syntax difference vs the bash snippets below: `VAR="value" command` does **not**
work in PowerShell. The steps below use the simpler approach — **edit the `.env`
file** — which works identically on Windows, macOS and Linux. (PowerShell
equivalent when you need it: `$env:VAR="value"; command`.)

---

## Step 1 — Push the code to GitHub

Extract the zip, then start a **fresh** git repository (the zip contains no
`.git` folder — that's deliberate):

```bash
cd proxima-elec
git init
git add .
git commit -m "Proxima Elec store"
git remote add origin https://github.com/<you>/proxima-elec.git
git push -u origin main
```

`.env`, `db/`, `download/` and `upload/` are git-ignored, so **no secrets and no
local database end up on GitHub** (only the `.env.example` template ships).

## Step 2 — Create a free Postgres database (Neon)

1. Sign up at [neon.tech](https://neon.tech) → **Create project**.
2. Copy the **connection string** (Dashboard → Connection string).
   It looks like: `postgresql://user:pass@ep-xxx.eu-central-1.aws.neon.tech/neondb?sslmode=require`

## Step 3 — Point the project at Postgres and seed it

On your machine, in the `proxima-elec` folder:

```bash
# install dependencies (bun is required for the seed scripts — see "Using Windows?" above)
bun install
```

Then make two small edits:

1. `prisma/schema.prisma` — switch the provider from sqlite to postgresql:
   ```prisma
   datasource db {
     provider = "postgresql"   // <- was "sqlite"
     url      = env("DATABASE_URL")
   }
   ```
2. `.env` — point it at the hosted database and choose your admin password:
   ```
   DATABASE_URL="postgresql://user:pass@ep-xxx...neon.tech/neondb?sslmode=require"
   ADMIN_PASSWORD="choose-a-strong-admin-password"
   ```
   Every command below auto-loads `.env` — no extra typing needed.

> Tip: in the Neon dashboard the connection string shown by default is the
> **pooled** one (host contains `-pooler`). Use the **direct** (non-pooled)
> string for the two local commands below — uncheck "pooled" in Neon's
> connection dropdown. The pooled one is the better choice for Vercel later.

Now create the tables and seed the data:

```bash
bun run db:push    # create tables in Neon
bun run db:seed    # 16 products + settings + admin account
bun run db:demo    # optional: 8 demo orders to explore the admin panel
```

The seed creates the 16 demo products, the default site settings, and the admin
account whose password is the bcrypt hash of `ADMIN_PASSWORD`.

> Bash users can skip editing `.env` and prefix commands instead:
> `DATABASE_URL="..." bun run db:push`. On **Windows PowerShell** use
> `$env:DATABASE_URL="..."; bun run db:push` — or just edit `.env` as shown above.

## Step 4 — Deploy on Vercel

1. [vercel.com/new](https://vercel.com/new) → **Import** your `proxima-elec` repo.
2. Framework preset: **Next.js** (auto-detected). Leave Build Command default.
3. **Environment Variables** (Project → Settings → Environment Variables):

| Variable | Value |
|---|---|
| `DATABASE_URL` | your Neon connection string |
| `ADMIN_PASSWORD` | the strong password you chose |
| `NEXT_PUBLIC_SITE_URL` | `https://your-project.vercel.app` |

4. Click **Deploy**. First build takes ~2 minutes (`postinstall` runs
   `prisma generate` automatically).

That's it — your store is live at `https://<project>.vercel.app` and the admin
panel at `https://<project>.vercel.app/admin`.

> Note: `NEXT_PUBLIC_SITE_URL` is baked in at **build time** — if you change it
> later (or add a custom domain), update the env var and trigger a **redeploy**
> (Vercel → Deployments → ⋯ → Redeploy).

## Step 5 — Log in and lock things down

1. Open `/admin`, sign in with your `ADMIN_PASSWORD`.
2. **Change the password**: Admin → **Content** tab → *Security* card →
   *Change password* (min 8 chars). Changing it revokes every existing session.
3. Load your real products in the **Products** tab:
   - **Image**: click *Upload image* and pick any photo from your device
     (JPG/PNG/WebP under 4 MB — it is resized and compressed automatically),
     or paste an `https://` link if the photo is already online.
   - Optional: fill the **FR / AR translations** for the product name and
     description — customers see the right language automatically.
4. Edit every text on the home page from the **Content** tab — brand name,
   logo URL, hero, stats (e.g. the "Wilayas served" number), features,
   categories, contact links, footer, delivery fees per wilaya, how many
   products the home page shows — then **Save & publish**.
5. The **Header** card edits the top bar (menu links, labels), the
   **Layout** card reorders / shows / hides the home-page sections and the
   floating WhatsApp button, the **Languages** card edits the French and
   Arabic translations of every section, and the **Footer** card controls
   every footer title and link. Everything on the storefront is editable —
   no code changes, no redeploys.

---

## Updating your live site (the easy way)

Two kinds of changes, two easy paths:

| What you changed | What to do |
|---|---|
| Texts, products, images, prices, languages, section order (anything from the **admin panel**) | **Nothing.** It's live the second you press Save & publish. |
| The **code** (a bug fix, a feature I sent you, a new page) | `git add .` → `git commit -m "update"` → `git push` — Vercel rebuilds automatically in ~2 min. |

So the loop for code updates is always:

```bash
cd proxima-elec
git add .
git commit -m "Update"
git push
```

Watch the build at vercel.com → your project → **Deployments** (a green ✓ =
live). If a code update ever included database changes (new columns), also
run `bun run db:push` once before pushing — I'll always tell you when that's
needed.

---

## Keeping the database free — forever

Everything below is **already built into the project**. This section just
explains why your store stays comfortably inside the free tier.

### Why this store fits the free tier easily

| Provider (free plan) | What's included | What Proxima Elec uses |
|---|---|---|
| **Neon** (recommended) | 0.5 GB storage, ~10 projects, compute that scales to zero (only counted while queries run) | Even 1,000 products + 10,000 orders is only a few **MB** — under 1% of the cap |
| **Supabase** (alternative) | 500 MB database, 2 projects, generous bandwidth | Same — a few MB |

There is no time limit on either free plan — they are free indefinitely as
long as you stay under the storage/compute caps, which this store won't
approach.

### The one rule that actually matters: inactivity

Free database providers pause or clean up projects that receive **no
activity** for weeks:

- **Supabase** pauses a free project after ~7 days with zero traffic.
- **Neon** may eventually remove free projects inactive for an extended period.

Your store solves this **automatically** — nothing for you to do:

1. The project ships with `vercel.json`, which registers a **Vercel cron job**
   that calls `/api/health` **once a day** (03:00 UTC).
2. That endpoint runs a real database query, which registers as activity and
   keeps the project marked "active" forever.
3. If you followed the deploy steps above, the cron is already live — Vercel
   picks it up from `vercel.json` on the first deploy, and the Hobby (free)
   plan allows one daily run, which is exactly what we use.

You can see it working in Vercel → Project → **Crons** after your first deploy.

### Connection tip for Neon (serverless)

If you ever see `prepared statement ... does not exist` or intermittent
connection errors on Vercel, use Neon's **pooled** connection string instead:
in the Neon dashboard it's the one whose host contains `-pooler`. It is made
for serverless apps and avoids these errors entirely.

### Belt and suspenders: the Backup button

Free tiers can change their policies over the years (rare, but it happens).
So the admin panel has a built-in insurance policy:

- **Admin → Content → "Backup" card → Download backup** exports **everything**
  (products, orders, site settings) as one JSON file.
- Recommended rhythm: **once a month**, and before/after big changes.
- If a provider ever disappeared or you outgrew the free tier, you'd point
  `DATABASE_URL` at any new database, run `db:push`, and restore from the
  backup — the store survives, nothing is lost.

---

## Local development

```bash
bun install
bun run db:push     # create SQLite tables
bun run db:seed     # products + settings + admin (password: ADMIN_PASSWORD, default proxima2025)
bun run db:demo     # optional — 8 demo orders to explore the admin panel
bun run dev         # http://localhost:3000  (admin at /admin)
```

Works the same on Windows (PowerShell) — see "Using Windows?" at the top.

## Troubleshooting

| Symptom | Fix |
|---|---|
| `bun` is "not recognized" (Windows) | Install it: `powershell -c "irm bun.sh/install.ps1 | iex"`, then open a **new** PowerShell window. See "Using Windows?" at the top. |
| `git` is "not recognized" (Windows) | Install Git for Windows: [git-scm.com/download/win](https://git-scm.com/download/win). |
| `The term 'DATABASE_URL' ...` on Windows | That's bash prefix syntax — PowerShell doesn't support it. Edit `.env` instead (Step 3), or use `$env:DATABASE_URL="..."; command`. |
| Admin login says "Incorrect password" | The admin account is created from `ADMIN_PASSWORD` on first login attempt after a fresh deploy. If the password was changed later, use the new one — or reset it by deleting the admin row (Neon console → SQL editor → `DELETE FROM "AdminUser";`) and logging in again: the account is re-created from `ADMIN_PASSWORD`. |
| Login says "no ADMIN_PASSWORD configured" | The `ADMIN_PASSWORD` env var is missing on the server — add it in Vercel → Settings → Environment Variables, then redeploy. |
| `P1001: Can't reach database` on Vercel | `DATABASE_URL` env var missing/wrong in Vercel settings, or Neon project is suspended (free tier sleeps — ping it in the Neon dashboard). |
| Product images not showing | Image fields must be direct `https://` URLs to real photos, or images uploaded with the *Upload image* button (they start with `/api/images/`). |
| Data resets on Vercel | You are still on SQLite — do Step 2/3 (Postgres). |
| `prepared statement ... does not exist` | Use Neon's **pooled** connection string (host contains `-pooler`) — see the note above. |
| Arabic shows English for some texts | The admin left those FR/AR fields empty in Content → Languages — empty fields fall back to English on purpose. |

## Production checklist

- [ ] `ADMIN_PASSWORD` changed via the Content → Security card
- [ ] `NEXT_PUBLIC_SITE_URL` set to the final domain (redeploy after changing)
- [ ] Custom domain added in Vercel (optional) — HTTPS + HSTS are already configured
- [ ] Real products loaded, demo content replaced with your own
- [ ] First monthly backup downloaded (Content → Backup)
