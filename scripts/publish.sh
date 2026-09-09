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

# Cache-busting: every deploy gets a fresh query string on CSS/JS refs
# (dist copies only — repo sources untouched), so no visitor ever sees
# a stale layout mixed with fresh scripts.
V=$(date -u +%Y%m%d%H%M%S)
for f in "$DIST"/index.html "$DIST"/generator.html; do
  sed -i.bak -E "s#((landing|style)\.css|js/[a-z0-9_-]+\.js)(\?v=[0-9]+)?#\1?v=$V#g" "$f"
  rm -f "$f.bak"
done

netlify deploy --prod --dir="$DIST" \
  --message "publish $(date -u +%Y-%m-%dT%H:%M:%SZ)"

echo "Live at: https://unicodechaos.netlify.app"
