#!/usr/bin/env bash
# Cadence — reset helper.
# Kills any running dev server, heals dependencies if broken, clears cache, restarts.
# Usage: npm run reset

set -e
echo "→ Killing any process on port 3000…"
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# Heal a broken install: if any critical dep is missing, nuke and reinstall.
if [ ! -d node_modules ] \
  || [ ! -d node_modules/@next/env ] \
  || [ ! -d node_modules/next ] \
  || [ ! -d node_modules/@supabase/ssr ]; then
  echo "→ Dependencies look broken. Doing a clean reinstall (~60s)…"
  rm -rf node_modules package-lock.json .next
  npm install
else
  echo "→ Dependencies OK."
fi

echo "→ Clearing .next cache…"
rm -rf .next
echo "→ Starting dev server…"
exec npm run dev
