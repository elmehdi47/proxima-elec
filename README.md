# Proxima Elec — Online Electronics Store

A production-ready e-commerce site for **Proxima Elec** (Algeria): speakers,
headphones, earbuds, TVs, projectors and accessories — with a full storefront,
a customer order flow (cash on delivery), and a complete admin panel that can
**change anything on the page**.

- **Storefront** → `/`
- **Full catalog page** → `/products` (home shows a 3-product glimpse + “View all”)
- **Admin panel** → `/admin` (receives and manages every order/command)

## Features

### Storefront (`/` and `/products`)
- Hero, brands strip, features, home catalog (3 featured products + “View all”)
- **`/products`** — the full catalog: search, category chips, brand chips,
  sorting (newest / price / rating), result counts, deep links (`?cat=…`)
- **Three languages: English · Français · العربية** — header switcher,
  Arabic flips the whole layout to RTL, choice remembered in a cookie,
  FR/AR product names + descriptions with English fallback
- Cart (localStorage) + checkout dialog: name, Algerian phone validation,
  wilaya dropdown with live per-wilaya delivery fees, free-shipping threshold
- Order placed in one click + "Confirm on WhatsApp" prefilled message
- WhatsApp floating button, contact cards, Instagram/Facebook integration
- Fully responsive, dark premium theme, sticky footer, a11y labels

### Admin panel (`/admin`)
- **Dashboard** — revenue, orders by status, 14-day charts, low stock
- **Orders (commands)** — live list with auto-refresh + new-order notification,
  status workflow (pending → confirmed → shipped → delivered / cancelled)
  with stock restoration, search/filters, WhatsApp-customer button
- **Products** — full CRUD (price, old price, badges, stock, images,
  featured/visible toggles) + **image upload from your device**
  (auto-compressed to WebP, stored in the database — works on Vercel) and
  **optional FR/AR translations per product**
- **Content (CMS)** — change *anything* on the page: brand name, logo URL,
  tagline, WhatsApp number/links, Instagram/Facebook URLs, hero texts + stats
  (e.g. "Wilayas served"), brands strip, categories, features, catalog heading
  and how many products the home page shows, contact section, footer,
  free-shipping threshold and the wilaya delivery-fee table (add/edit/remove
  wilayas). Plus the **default language**, **French & Arabic translations**
  for every section, and admin password change.
- **Backup** — one-click JSON export of products, orders, settings **and
  uploaded images**

### Security
- Admin auth with **bcrypt-hashed passwords** and **DB-backed sessions**
  (random 256-bit tokens, hashed at rest, 7-day expiry, revocation on logout
  and password change)
- **Rate limiting** on login, order placement and password change
- **CSRF protection** (SameSite cookies + Origin checks on mutations)
- **Security headers**: CSP, X-Frame-Options, nosniff, Referrer-Policy,
  Permissions-Policy, HSTS, `X-Robots-Tag: noindex` on `/admin`
- **Input validation** (zod) on every API; inactive products admin-only;
  order totals computed server-side
- HttpOnly cookies; secrets in env vars; `.env` git-ignored

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · shadcn/ui ·
Prisma (SQLite locally / Postgres on Vercel) · TanStack Query · Zustand ·
framer-motion · sonner

## Local development

```bash
bun install
bun run db:push     # create tables (SQLite at db/custom.db)
bun run db:seed     # 16 products + site settings + admin account
bun run dev         # http://localhost:3000 · admin at /admin
```

Default admin password comes from `ADMIN_PASSWORD` (`.env`, default
`proxima2025`) — change it in Admin → Content → Security.

## Deploying on Vercel (home + admin together)

See **[DEPLOY.md](./DEPLOY.md)** — step-by-step guide (GitHub → Neon Postgres →
Vercel, ~15 minutes). Both pages deploy as one app automatically.
