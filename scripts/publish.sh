#!/bin/bash
# Publish Unicode Chaos to Netlify (production).
# Rebuilds dist/ with ONLY the files the site needs (no README, no LICENSE,
# no dev files), then deploys it. One command, no hassle.
# Usage: bash scripts/publish.sh
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DIST="$ROOT/dist"

rm -rf "$DIST"
mkdir -p "$DIST/js" "$DIST/data"

cp "$ROOT/index.html" "$ROOT/generator.html" \
   "$ROOT/landing.css" "$ROOT/style.css" \
   "$ROOT/favicon.svg" "$ROOT/favicon-32.png" "$ROOT/apple-touch-icon.png" \
   "$DIST/"
cp "$ROOT/js/"*.js "$DIST/js/"
cp "$ROOT/data/"*.json "$DIST/data/"

netlify deploy --prod --dir="$DIST" \
  --message "publish $(date -u +%Y-%m-%dT%H:%M:%SZ)"

echo "Live at: https://unicodechaos.netlify.app"
