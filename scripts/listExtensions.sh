#!/usr/bin/env bash
# Inventaire des extensions du projet : tout ce qui suit le premier point du nom de fichier
# (errorLog.dto.ts -> .dto.ts, .gitignore -> .gitignore), avec le nombre de fichiers concernés.
# Ne compte que les fichiers du dépôt (suivis par git, ou nouveaux et non ignorés) : ni node_modules, ni builds,
# ni .env, ni docker/. Les dossiers todo_folder sont écartés.
# Usage : pnpm tools listExtensions   demande le dossier ; « / » (défaut) = la racine du dépôt
#         Non interactif : listExtensions <dossier>   (relatif à la racine : apps/client, packages/specs…)

set -euo pipefail

source "$(dirname "$0")/lib/prompt.sh"
cd "$(dirname "$0")/.."

folder="${1:-/}"
if [ $# -eq 0 ] && isInteractive; then
  askText "Dossier à analyser (/ = racine du dépôt)" "/"
  folder="$TEXT"
fi

# « / », « /apps/client/ » et « apps/client » désignent des dossiers du dépôt
folder="${folder#/}"
folder="${folder%/}"
[ -z "$folder" ] && folder="."
[ -d "$folder" ] || { echo "Dossier introuvable : $folder" >&2; exit 1; }

git ls-files --cached --others --exclude-standard -- "$folder" |
  grep -v '/todo_folder/' |
  sed 's#.*/##' |
  grep '\.' |
  sed 's/^[^.]*//' |
  sort |
  uniq -c |
  sort -rn
