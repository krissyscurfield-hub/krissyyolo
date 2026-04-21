# Cadence — User Guide

Your day, planned. Pulls from Apple Calendar, keeps every task on one timeline, and helps you know what to do next in under two seconds.

**Live app:** [cadenceyolo.netlify.app](https://cadenceyolo.netlify.app)

---

## Install it on your iPhone (30 seconds)

Cadence is a web app that installs like a native app. No App Store.

1. On your iPhone, open **Safari** (not Chrome)
2. Go to [cadenceyolo.netlify.app](https://cadenceyolo.netlify.app)
3. Sign in with your email — you'll get a 6-digit code, type it in
4. Once you're on the Today screen, tap the **Share** button at the bottom of Safari (square with an arrow pointing up)
5. Scroll down and tap **Add to Home Screen**
6. Tap **Add**

The Cadence icon appears on your home screen. Tap it — it launches full-screen, no Safari chrome, feels like any other app.

---

## Install it on your Mac

Same idea, via Chrome or Safari desktop.

1. Go to [cadenceyolo.netlify.app](https://cadenceyolo.netlify.app) in Chrome
2. In the URL bar, click the install icon (a small monitor with a down-arrow) — or use the menu → **Cast, save, and share → Install Cadence…**
3. It installs as a standalone app in your Applications folder

---

## Connect your Apple Calendar

This is what turns Cadence from a to-do list into a real planning system. Two-minute setup, one time only.

### 1. Get an app-specific password from Apple

Apple requires a dedicated password for third-party apps like Cadence — you can't use your regular Apple ID password.

1. On any device, go to [appleid.apple.com](https://appleid.apple.com/account/manage) and sign in
2. Click **Sign-In and Security**
3. Click **App-Specific Passwords**
4. Click **Generate an app-specific password**
5. Label it `Cadence`
6. Apple shows you a password that looks like `abcd-efgh-ijkl-mnop` — copy it immediately, this is your only chance to see it

### 2. Paste it into Cadence

1. Open Cadence, tap **Settings** (bottom right)
2. Enter your Apple ID email (the one you sign in to iCloud with)
3. Paste the app-specific password
4. Tap **Connect**

Cadence verifies with iCloud and saves the password encrypted. You'll never need to enter it again.

### 3. Sync

Tap **Sync now**. Your iCloud events appear on Today. From now on, any new task you schedule (with a time) in Cadence also gets saved to your Apple Calendar automatically.

---

## Using Cadence day to day

### Adding tasks — the quick way

The input at the top of Today and Inbox accepts shorthand:

| Type this | What it means |
|---|---|
| `Call Alex tomorrow 3pm` | Task scheduled for 3pm tomorrow |
| `Workout 6am 1h` | 60-min task at 6am (defaults to today or tomorrow if past) |
| `Taxes friday !1` | P1 task due Friday |
| `Deep work 9am 2h !1 #business` | P1 business task, 2 hours, starting 9am |
| `Respond to email` | Goes to Inbox (no time) |

Shorthand keys:
- **`!1` / `!2` / `!3`** — priority (1 is highest)
- **`#business` / `#personal`** — category
- **`today` / `tomorrow` / `monday`–`sunday`** — day
- **`3pm` / `10:30am` / `15:00`** — time
- **`30m` / `1h` / `1h30m`** — duration

### Plan my day

Tap **Plan my day** on Today. Cadence will:

1. Fit every unscheduled task into your free calendar windows, respecting work hours and priority
2. Let you pick up to 3 "must do today" items
3. Commit

Tasks that land on your timeline get pushed to Apple Calendar so they're on your phone's native alerts.

### Shutdown

Tap **Shutdown** at the end of the day. It's a 30-second close-out:

1. Unfinished tasks silently roll to tomorrow's inbox (no red "overdue" shame)
2. Optional one-line reflection
3. Done

Wake up tomorrow with yesterday's leftovers waiting and nothing in your head.

### Must Do Today / Can Do Later

Every day caps at three "must do" tasks, shown in the top strip. Everything else is "can do later." This is the single most important constraint — it forces you to pick what actually matters.

To promote a Can Do Later task into Must Do, hover/tap → **Must do**.

---

## Share it with someone else

Anyone can make their own Cadence in five minutes. Just send them [cadenceyolo.netlify.app](https://cadenceyolo.netlify.app) and this guide.

Their sign-in, their tasks, their calendar connection — everything is isolated per account. You don't see theirs, they don't see yours.

---

## Troubleshooting

**I got a "2 seconds" rate limit on sign-in.** Normal — Supabase limits how fast you can request login codes. Wait three seconds and tap again.

**iCloud rejected my credentials.** Either the email isn't the correct Apple ID, or the app-specific password was mistyped. Generate a new one at appleid.apple.com and try again. Education / school Apple IDs sometimes have CalDAV disabled by admins — if so, you'll need to use a personal iCloud account.

**Tasks aren't showing up in Apple Calendar.** Check that the task has a scheduled time (not just a due date). Tasks without times live in Cadence only. Also make sure **Sync now** has been run at least once.

**Something looks off after I added a feature.** Restart the dev server (locally) with `npm run reset`. On the live site, refresh the browser tab.

---

## Design principles you can trust

- **No red.** Overdue tasks silently roll forward instead of shaming you.
- **Cap of 3 for Must Do Today.** Forced, non-negotiable.
- **One surface.** Calendar events, tasks, workouts — all on the same timeline.
- **Ritual over chaos.** Plan my day and Shutdown are 60-second routines, not essays.
- **Keyboard-first on Mac, thumb-first on iPhone.**

The goal is: open app, know what to do, close app, go do it. If a feature doesn't serve that loop, it's not in Cadence.
