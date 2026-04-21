# Cadence

Personal scheduling and execution system. Apple Calendar–native, keyboard-first, opinionated.

Built on Next.js 14 (App Router) · TypeScript · Tailwind · Supabase · Netlify.

---

## What's in the box

- Sign-in via Supabase magic link
- Apple Calendar sync (CalDAV, iCloud) — two-way: reads your events, writes Cadence-scheduled tasks back as calendar events
- Task inbox with natural-language quick-add (`Call Alex tomorrow 3pm !1 #business`)
- Today timeline (5am–11pm grid) with events and scheduled tasks
- Week view
- Must Do Today / Can Do Later split (capped at 3)
- **Plan My Day** — rules-based auto-scheduler that fits tasks into free windows respecting work hours and quiet hours
- **Shutdown** — one-tap close-out that silently rolls unfinished tasks forward (no red overdue)
- Priority (P1/P2/P3), categories (Personal / Business seeded by default)
- Work hours + quiet hours configurable per user
- All data scoped by Supabase RLS — never leaks between accounts

---

## Setup (≈20 min first time)

You'll do four things: create a Supabase project, run the SQL, grab an Apple app-specific password, and deploy to Netlify. Local dev works in parallel.

### 1. Install dependencies

```bash
cd cadence
npm install
```

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) → **New project**. Name it `cadence`.
2. Once it's ready, open **SQL Editor** → paste the contents of `supabase/migrations/001_init.sql` → **Run**. This creates tables, RLS policies, and the auto-signup trigger.
3. Go to **Authentication → Providers**, confirm **Email** is enabled (magic link is on by default).
4. Go to **Authentication → URL Configuration** and set:
    - Site URL: `http://localhost:3000` (for now; swap for your Netlify URL after deploy)
    - Redirect URLs: add both `http://localhost:3000/auth/callback` and `https://YOUR-SITE.netlify.app/auth/callback`.
5. Go to **Project Settings → API** and copy:
    - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
    - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
    - `service_role` → `SUPABASE_SERVICE_ROLE_KEY` (server-only; don't ship to the client)

### 3. Generate an encryption key

Cadence encrypts your Apple app-specific password at rest using AES-256-GCM.

```bash
openssl rand -hex 32
```

Save the output as `CADENCE_ENCRYPTION_KEY`.

### 4. Create your local `.env.local`

```bash
cp .env.example .env.local
```

Fill in the values from steps 2 and 3.

### 5. Run locally

```bash
npm run dev
```

Open http://localhost:3000 → sign in with email → check your inbox for the magic link → you'll land on Today.

### 6. Connect Apple Calendar

1. Sign in to [appleid.apple.com](https://appleid.apple.com/account/manage) → **Sign-In and Security** → **App-Specific Passwords** → generate one and label it `Cadence`.
2. In Cadence, go to **Settings → Calendar**, enter your Apple ID email and the app-specific password, click **Connect**.
3. Click **Sync now**. Your iCloud events appear on Today and Week.

Now add a task with a time (`Workout 6am tomorrow`, `Submit invoices Friday 2pm !1`). Hit **Plan My Day** on Today. Watch your tasks land on the timeline — and appear in your Apple Calendar within seconds.

### 7. Deploy to Netlify

1. Push this repo to GitHub.
2. Netlify → **Add new site → Import an existing project** → pick the repo. Build settings are already in `netlify.toml`.
3. In **Site settings → Environment variables**, paste every value from your `.env.local`. Replace `NEXT_PUBLIC_SITE_URL` with your Netlify URL (e.g. `https://cadence-krissy.netlify.app`).
4. Back in Supabase → **Auth → URL Configuration**, add that Netlify URL to both Site URL and the redirect list.
5. Deploy. Magic-link sign-in, Apple Calendar sync, and all writes work the same in prod.

---

## Design promise, enforced

> Open app. Know what to do. Close app. Go do it.

If a feature doesn't serve that loop, it doesn't ship. No projects. No nested lists. No Kanban. No red overdue. Unfinished tasks silently flow forward at Shutdown.

---

## Repo map

```
cadence/
├── supabase/migrations/001_init.sql   # Paste into Supabase SQL editor
├── src/
│   ├── app/                           # Next.js App Router
│   │   ├── (app)/                     # Authed shell (sidebar)
│   │   │   ├── today/                 # Hero screen
│   │   │   ├── week/
│   │   │   ├── inbox/
│   │   │   └── settings/
│   │   ├── api/
│   │   │   ├── tasks/…
│   │   │   ├── calendar/{connect,sync,events}/
│   │   │   └── plan/{day,shutdown}/
│   │   ├── sign-in/
│   │   └── auth/callback/
│   ├── components/                    # UI — TodayView, DayTimeline, modals, forms
│   └── lib/
│       ├── supabase/{client,server,middleware}.ts
│       ├── caldav.ts                  # tsdav + ical.js — Apple sync + write-back
│       ├── scheduler.ts               # rules-based auto-scheduler
│       ├── parse.ts                   # natural-language task parser
│       ├── encrypt.ts                 # AES-256-GCM for app password
│       ├── types.ts
│       └── utils.ts
├── middleware.ts                      # Supabase auth guard
├── netlify.toml
└── .env.example
```

---

## Natural-language quick-add

The input on Today and Inbox accepts shorthand:

- **`!1` / `!2` / `!3`** — priority
- **`#business` / `#personal`** — category
- **`today` / `tomorrow` / `monday`** — day
- **`3pm` / `10:30am` / `15:00`** — time
- **`30m` / `1h` / `1h30m`** — duration

Example: `Strength session tomorrow 6am 1h !1 #personal`

---

## Where things go next

- **V2**: AI schedule assistant (Claude API, suggestion-only), energy-tag windows, habits embedded in Today, focus mode, Sunday Reset, native iOS via SwiftUI + EventKit.
- **V3**: unified inbox from Gmail/Slack, smart re-flow with diff preview, weekly analytics, Siri Shortcut for voice capture.

Full strategy, screen-by-screen breakdown, and roadmap live in `Cadence_Product_Spec.md` at the project root.
