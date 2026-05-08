#!/bin/bash
set -e

# 1. Install deps and build Tailwind
npm ci
./node_modules/.bin/tailwindcss -i src/input.css -o assets/css/tailwind.min.css --minify

# 2. Inject form endpoint into index.html
if [ -n "$FORM_ENDPOINT" ]; then
  sed -i "s|https://formspree.io/f/REPLACE_WITH_YOUR_ID|${FORM_ENDPOINT}|g" index.html
fi

echo "Build complete."
