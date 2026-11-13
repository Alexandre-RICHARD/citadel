#!/usr/bin/env bash
# Vérifie les liens et les ancres de la documentation (README.md, CLAUDE.md, docs/) : un lien vers un fichier ou un titre
# qui n'existe plus se corrige à la main. À lancer après une grosse édition de la doc ; ne demande pas Internet.
# Pourquoi pas dans validate-all : il se saute quand seuls des .md ont changé, et c'est justement là que les liens cassent.
# Usage : pnpm tools checkDocLinks

set -euo pipefail

cd "$(dirname "$0")/.."
node scripts/lib/checkDocLinks.mjs
