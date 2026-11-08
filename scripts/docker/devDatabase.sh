#!/usr/bin/env bash
# Les bases de dev et de test sur Docker Desktop (compose.dev.yml).
# Usage : bash scripts/docker/devDatabase.sh <up|migrate|down|reset>
#   up        lance la base de dev, puis les migrations
#   migrate   applique les migrations Flyway
#   down      arrête les bases de dev et de test (données gardées)
#   reset     efface la base de dev et la refait (up)

set -euo pipefail

cd "$(dirname "$0")/../.."

compose=(docker compose -f compose.dev.yml)

case "${1:-}" in
	up)
		"${compose[@]}" up --detach --wait mariadb-dev
		"${compose[@]}" run --rm flyway-dev
		;;
	migrate) "${compose[@]}" run --rm flyway-dev ;;
	down) "${compose[@]}" --profile dev --profile test down ;;
	reset)
		"${compose[@]}" --profile dev down --volumes
		bash "$0" up
		;;
	*)
		echo "Usage : $0 <up|migrate|down|reset>" >&2
		exit 1
		;;
esac
