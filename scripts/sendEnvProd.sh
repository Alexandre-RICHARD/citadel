#!/usr/bin/env bash
# =====================================================================================
# sendEnvProd.sh : lancé par `pnpm tools sendEnvProd`, sur ton PC, dans Git Bash
# =====================================================================================
#
# Envoie .env.prod du PC (./.env.prod) sur le NAS (/Volume1/citadel/.env.prod), après
# avoir montré ce qui diffère entre les deux et demandé confirmation.
#
#   - Seules les lignes qui diffèrent s'affichent : en rouge celles du NAS, en vert celles du
#     PC. Les valeurs y figurent : à lancer dans ton terminal, pas devant un partage d'écran.
#   - Envoi écrit à côté puis renommé, en 600 : jamais un .env.prod à moitié écrit.
#   - L'ancien fichier du NAS reste à côté, en .env.prod.avant-envoi.
#
# Pourquoi Git Bash : pnpm lance `bash`, qui sous PowerShell serait celui de WSL, sans tes
# clés SSH.

set -euo pipefail

# Le NAS : alias de ton ~/.ssh/config
NAS=nas
NAS_DIR=/Volume1/citadel
ENV_FILE=.env.prod

say() { printf '%s\n' "$*"; }
die() {
	printf '\033[31mErreur : %s\033[0m\n' "$*" >&2
	exit 1
}

source "$(dirname "$0")/lib/prompt.sh"

# Toujours depuis la racine du dépôt, d'où que pnpm lance le script
cd "$(git rev-parse --show-toplevel)"

[[ -f $ENV_FILE ]] || die "$ENV_FILE introuvable à la racine du dépôt"
# Le NAS d'abord : injoignable, on s'arrête ici plutôt qu'au milieu
remote_env=$(ssh -o ConnectTimeout=10 "$NAS" "cat $NAS_DIR/$ENV_FILE" 2>/dev/null) ||
	die "NAS injoignable, ou $NAS_DIR/$ENV_FILE absent (ssh $NAS echo ok)"
local_env=$(<"$ENV_FILE")

if [[ $local_env == "$remote_env" ]]; then
	say "Identiques : rien à envoyer."
	exit 0
fi

# Seules les lignes qui changent, sans en-tête ni contexte et sans pager (git diff ouvrait
# `less`, d'où le « : » qui réaffichait tout). Rouge « - » : sur le NAS seulement (l'ancien).
# Vert « + » : sur le PC seulement (le nouveau, celui qui sera envoyé). Une valeur modifiée
# donne donc une ligne rouge puis une verte. Les valeurs s'affichent : c'est ton terminal.
# diff rend 1 quand les fichiers diffèrent, d'où le « || true »
say "Rouge (-) : sur le NAS, sera remplacé.   Vert (+) : sur le PC, sera envoyé."
say ""
diff \
	--unchanged-line-format='' \
	--old-line-format=$'\033[31m- %L\033[0m' \
	--new-line-format=$'\033[32m+ %L\033[0m' \
	<(printf '%s\n' "$remote_env") <(printf '%s\n' "$local_env") || true
say ""

# Sans terminal, rien n'est demandé dans le vide : on n'écrase pas un secret sans réponse
isInteractive || die "confirmation impossible sans terminal : relance depuis un terminal"
say ""
say "L'envoi écrase celui du NAS (copie gardée en $ENV_FILE.avant-envoi)."
askConfirm "Envoyer $ENV_FILE sur le NAS ?" || die "annulé : rien n'a été envoyé"

ssh "$NAS" "umask 077 && cp -p $NAS_DIR/$ENV_FILE $NAS_DIR/$ENV_FILE.avant-envoi && cat > $NAS_DIR/$ENV_FILE.new && mv $NAS_DIR/$ENV_FILE.new $NAS_DIR/$ENV_FILE" <"$ENV_FILE"
say "Envoyé."
