#!/usr/bin/env bash
# =====================================================================================
# deploy.sh : lancé par `pnpm tools deploy`, sur ton PC, dans Git Bash
# =====================================================================================
#
#   pnpm tools deploy             la version = le dernier tag, à confirmer
#   pnpm tools deploy v2026.11.16.01
#
# Relance seulement le déploiement d'une version déjà publiée (tag poussé, images sur
# ghcr.io) : après un échec de `pnpm tools release` à l'étape 6, par exemple parce que
# .env.prod du NAS n'était pas à jour (`pnpm tools sendEnvProd` l'envoie). Ni validation,
# ni tag, ni push.
#
#   1. La version, à confirmer.
#   2. ssh -t nas … citadel deploy <version> : le NAS montre son plan et te redemande
#      confirmation, comme avec release. Jusque-là, rien n'a bougé.
#
# Pourquoi Git Bash : pnpm lance `bash`, qui sous PowerShell serait celui de WSL, sans tes
# clés SSH.

set -euo pipefail

# Le NAS : alias de ton ~/.ssh/config
NAS=nas
NAS_CITADEL=/Volume1/citadel/citadel

say() { printf '%s\n' "$*"; }
step() { printf '\n\033[1m== %s\033[0m\n' "$*"; }
die() {
	printf '\033[31mErreur : %s\033[0m\n' "$*" >&2
	exit 1
}

source "$(dirname "$0")/lib/prompt.sh"

# Toujours depuis la racine du dépôt, d'où que pnpm lance le script
cd "$(git rev-parse --show-toplevel)"

# -------------------------------------------------------------------------------------
step "1. Version"
version=${1:-}
if [[ -z $version ]]; then
	version=$(git tag --list 'v*' --sort=-v:refname | head -n 1)
	[[ -n $version ]] || die "aucun tag : donne la version en argument (pnpm tools deploy vAAAA.MM.JJ.NN)"
	say "  Dernier tag : $version"
	if isInteractive; then
		askConfirm "Déployer $version ?" o || die "annulé : rien n'est parti"
	fi
fi
[[ $version =~ ^v[0-9]{4}\.[0-9]{2}\.[0-9]{2}\.[0-9]{2}$ ]] || die "version invalide : $version (attendu : vAAAA.MM.JJ.NN)"
git rev-parse --verify --quiet "refs/tags/$version" >/dev/null || die "le tag $version n'existe pas ici (git fetch --tags)"

# -------------------------------------------------------------------------------------
step "2. Déploiement sur le NAS"
# -t : un terminal sur le NAS, pour la confirmation [o/N] de citadel.
# Chemin complet : une commande lancée par SSH n'a pas le PATH de ta session.
ssh -t "$NAS" "$NAS_CITADEL deploy $version"
