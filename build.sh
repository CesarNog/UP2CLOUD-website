#!/bin/bash
set -e

# 1. Install deps and build Tailwind
npm ci
./node_modules/.bin/tailwindcss -i src/input.css -o assets/css/tailwind.min.css --minify

# 2. Inject secrets into index.html
if [ -n "$GROQ_API_KEY" ]; then
  sed -i "s|REPLACE_WITH_GROQ_KEY|${GROQ_API_KEY}|g" index.html
fi

if [ -n "$FORM_ENDPOINT" ]; then
  sed -i "s|https://formspree.io/f/REPLACE_WITH_YOUR_ID|${FORM_ENDPOINT}|g" index.html
fi

echo "Build complete."
