#!/usr/bin/env bash
# Vérifie que tous les fichiers de variables ont la même structure : mêmes variables, dans le même ordre,
# commentées ou non (une variable dont le fichier n'a pas besoin y reste, commentée).
# Référence : .env.example. Les fichiers absents (.env et .env.test ne sont pas versionnés) sont ignorés.
# Usage : pnpm tools checkEnvFiles

set -euo pipefail

cd "$(dirname "$0")/.."

# Les noms des variables, dans l'ordre : « NOM=… » ou « # NOM=… » en début de ligne
listVariables() {
	grep -oE '^(# )?[A-Z][A-Z0-9_]*=' "$1" | sed -E 's/^# //; s/=$//'
}

reference=".env.example"
failed=0
for file in .env .env.test .env.prod.example infra/compose.local.env; do
	[ -f "$file" ] || { echo "-  $file : absent, ignoré"; continue; }
	if difference="$(diff <(listVariables "$reference") <(listVariables "$file"))"; then
		echo "OK $file"
	else
		echo "KO $file (< $reference, > $file) :"
		echo "$difference"
		failed=1
	fi
done
exit "$failed"
