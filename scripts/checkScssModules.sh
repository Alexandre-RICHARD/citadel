#!/usr/bin/env bash
# Liste les fichiers *.module.scss qu'aucun fichier .ts/.tsx n'importe.
# Ne vérifie pas que les classes du module sont utilisées.
# Usage : pnpm tools checkScssModules

set -euo pipefail

root="$(realpath "$(dirname "$0")/..")"
cd "$root"

# Mêmes alias que apps/client/vite.config.ts
declare -A ALIASES=(["@/"]="apps/client/src/" ["@styles/"]="apps/client/src/styles/")

find_sources() {
	find apps packages \( -name node_modules -o -name todo_folder -o -name build -o -name report \) -prune -o -type f "$@" -print
}

# Chemins absolus de tous les .module.scss importés
imported="$(
	find_sources \( -name "*.ts" -o -name "*.tsx" \) |
		while IFS= read -r file; do
			grep -oE "from ['\"][^'\"]+\.module\.scss['\"]" "$file" |
				sed -E "s/^from ['\"]//; s/['\"]$//" |
				while IFS= read -r specifier; do
					for alias in "${!ALIASES[@]}"; do
						if [[ "$specifier" == "$alias"* ]]; then
							realpath -m "${ALIASES[$alias]}${specifier#"$alias"}"
							continue 2
						fi
					done
					realpath -m "$(dirname "$file")/$specifier"
				done || true
		done | sort -u
)"

unused=0
while IFS= read -r scssFile; do
	if ! grep -qxF "$(realpath "$scssFile")" <<<"$imported"; then
		echo "Non importé : $scssFile"
		unused=$((unused + 1))
	fi
done < <(find_sources -name "*.module.scss" | sort)

if [ "$unused" -eq 0 ]; then
	echo "Tous les .module.scss sont importés"
else
	echo "$unused .module.scss non importé(s)"
	exit 1
fi
