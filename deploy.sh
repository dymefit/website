#!/bin/bash
# Fitness-Elevated production deploy: build the app, assemble dist
# (home page + hero + security headers), push to Netlify.
set -euo pipefail
cd "$(dirname "$0")"

npm run build
cp home/index.html dist/index.html
cp home/_headers dist/_headers
cp public/hero.jpg dist/hero.jpg
netlify deploy --prod --dir=dist --functions=netlify/functions
