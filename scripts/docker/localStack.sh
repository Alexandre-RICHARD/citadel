#!/usr/bin/env bash
# La stack complète sur ton PC (celle de la prod, voir infra/compose.local.yml), pour la tester avant une release
# ou pour les tests end-to-end.
# Usage : bash scripts/docker/localStack.sh <prod|e2e> <up|down>
#   prod up     construit nos images et lance tout (pnpm prod:local)
#   e2e up      pareil, plus le faux Brevo et Mailpit des tests end-to-end (infra/compose.e2e.yml)
#   * down      arrête tout et EFFACE les données (volumes compris : base, mails)
# Les deux modes partagent le même projet Compose (citadel-local) : on n'en lance qu'un à la fois.

set -euo pipefail

mode="${1:-}"
action="${2:-}"

# Toujours depuis la racine du dépôt, d'où que le script soit lancé (pnpm le lance depuis le dossier du package)
cd "$(dirname "$0")/../.."

composeFiles=(-f infra/compose.yml -f infra/compose.local.yml)
case "$mode" in
	prod) ;;
	e2e) composeFiles+=(-f infra/compose.e2e.yml) ;;
	*)
		echo "Usage : $0 <prod|e2e> <up|down>" >&2
		exit 1
		;;
esac

# Le .env (identifiants IGDB…), puis compose.local.env, qui gagne : clés factices, jamais les vraies
compose=(docker compose -p citadel-local "${composeFiles[@]}" --env-file .env --env-file infra/compose.local.env)

case "$action" in
	up)
		# Un conteneur arrêté garde l'identifiant du réseau où il était attaché. Si Compose a recréé ce réseau entre-temps
		# (autre mode lancé, down, redémarrage de Docker), il ne redémarre plus : "network ... not found". On supprime donc
		# les conteneurs arrêtés du projet ; le up les recrée, et les volumes (base, mails) ne sont pas touchés.
		docker container prune --force --filter "label=com.docker.compose.project=citadel-local" > /dev/null
		"${compose[@]}" up --build --detach --wait
		;;
	down) "${compose[@]}" down --volumes ;;
	*)
		echo "Usage : $0 <prod|e2e> <up|down>" >&2
		exit 1
		;;
esac
