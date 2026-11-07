#!/usr/bin/env bash
# Supprime tout ce qui se regénère : dépendances, builds, rapports, fichiers temporaires des tests.
# Usage : pnpm tools clean   pose ses questions (liste, confirmation, réinstallation).
#         Non interactif : --dry-run (liste seulement) ou --yes (supprime sans demander).
# Après : pnpm install-dependencies (node_modules supprimés), puis pnpm build si besoin.
#
# Ce que ce script NE touche PAS, bien qu'ignoré par git :
#   - .vscode/   : ta configuration
#   - .env, .env.test, .env.prod : tes variables et secrets
#   - docker/    : l'ancienne sauvegarde de déploiement (docker/other/alex_deploy_backup, avec son .env),
#                  absente de git et impossible à retrouver
# Si .gitignore reçoit un nouveau dossier regénérable, l'ajouter à la liste ci-dessous.

set -euo pipefail

cd "$(dirname "$0")/.."
source scripts/lib/prompt.sh

targets=(
	node_modules
	report
	apps/admin/build
	apps/admin/node_modules
	apps/client/build
	apps/client/node_modules
	apps/client/tsBuildInfo.json
	apps/server/build
	apps/server/node_modules
	# Journaux de restauration créés par les tests d'intégration
	apps/server/.local
	.local
	packages/common/node_modules
	packages/design-system/build
	packages/design-system/node_modules
	packages/eslint-config/node_modules
	packages/specs/node_modules
	e2e/node_modules
	e2e/report-e2e
)

existing=()
for target in "${targets[@]}"; do
	[ -e "$target" ] && existing+=("$target")
done

if [ ${#existing[@]} -eq 0 ]; then
	echo "Rien à supprimer."
	exit 0
fi

echo "À supprimer :"
du -sh "${existing[@]}" | sed 's/^/  /'

mode="${1:-}"
[ "$mode" = "--dry-run" ] && exit 0

if [ "$mode" != "--yes" ]; then
	isInteractive || { echo "Pas de terminal : relance avec --dry-run ou --yes." >&2; exit 1; }
	echo
	echo "Conservés : .vscode/, .env, .env.test, .env.prod, docker/ (ancienne sauvegarde de déploiement)."
	echo "Attention : sans node_modules, plus rien ne se lance avant la réinstallation."
	askConfirm "Supprimer ces ${#existing[@]} éléments ?" n || { echo "Annulé."; exit 0; }
fi

rm -rf "${existing[@]}"
echo "Supprimé."

if [ "$mode" != "--yes" ] && askConfirm "Réinstaller les dépendances maintenant (pnpm install) ?" o; then
	pnpm install
else
	echo "Pour réinstaller : pnpm install-dependencies"
fi
