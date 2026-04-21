#!/usr/bin/env bash
# Cadence — git init + commit + push helper.
# First run: creates local git, commits, asks for your GitHub repo URL, pushes.
# Every subsequent run: just commits pending changes and pushes.
# Usage: npm run ship

set -e

if [ ! -d .git ]; then
  echo "→ Initializing git…"
  git init
  git branch -M main
fi

git add .

if git diff --cached --quiet; then
  echo "→ No changes to commit."
else
  echo "→ Committing changes…"
  read -p "Commit message (press return for default): " msg
  msg=${msg:-"Update"}
  git commit -m "$msg"
fi

if ! git remote | grep -q origin; then
  echo ""
  echo "→ No GitHub remote configured yet."
  echo "  Go to https://github.com/new and create a private repo called 'cadence' (don't initialize with README)."
  echo "  Copy its HTTPS URL — it looks like https://github.com/YOUR-USERNAME/cadence.git"
  read -p "Paste URL here: " url
  git remote add origin "$url"
fi

echo "→ Pushing to GitHub…"
git push -u origin main
echo "✓ Done. Your code is on GitHub."
