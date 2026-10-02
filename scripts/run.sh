#!/usr/bin/env bash
# Lance un script du dossier scripts/ : il suffit d'y déposer un fichier .sh pour qu'il soit proposé.
# Usage : pnpm tools                  -> menu des scripts disponibles
#         pnpm tools <nom> [args...]  -> lance scripts/<nom>.sh directement

set -euo pipefail

scriptsDir="$(dirname "$0")"
mapfile -t available < <(find "$scriptsDir" -maxdepth 1 -name "*.sh" ! -name "run.sh" -printf "%f\n" | sed 's/\.sh$//' | sort)

if [ $# -eq 0 ]; then
	PS3="Script à lancer : "
	select name in "${available[@]}"; do
		[ -n "${name:-}" ] && break
	done
else
	name="$1"
	shift
fi

if [ ! -f "$scriptsDir/$name.sh" ]; then
	echo "Script inconnu : $name (disponibles : ${available[*]})" >&2
	exit 1
fi

bash "$scriptsDir/$name.sh" "$@"
