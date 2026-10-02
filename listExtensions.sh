#!/usr/bin/env bash
# Inventaire des extensions du projet : tout ce qui suit le premier point du nom de fichier
# (errorLog.dto.ts -> .dto.ts, .gitignore -> .gitignore), avec le nombre de fichiers concernés.
# Usage : bash listExtensions.sh [dossier]   (dossier par défaut : celui du script)

set -euo pipefail

root="${1:-$(dirname "$0")}"

find "$root" \( -name node_modules -o -name todo_folder -o -name build -o -name .git -o -name report \) -prune -o -type f -print |
  sed 's#.*/##' |
  grep '\.' |
  sed 's/^[^.]*//' |
  sort |
  uniq -c |
  sort -rn
