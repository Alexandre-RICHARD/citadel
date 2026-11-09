#!/usr/bin/env bash
# =====================================================================================
# validateAll.sh : lancé par `pnpm validate-all`, sur ton PC, dans Git Bash
# =====================================================================================
#
#   pnpm validate-all            valide tout, sauf si rien n'a changé depuis la dernière
#                                validation réussie (depuis un terminal : il te demande
#                                alors s'il faut relancer quand même)
#   pnpm validate-all --force    valide tout, même si rien n'a changé
#
# C'est la validation d'avant mise en prod (pnpm release la lance), pas celle du dev
# courant : elle est longue. Pendant le dev, lint, check-types et les tests concernés
# suffisent.
#
# Les étapes, chacune arrête tout si elle échoue :
#   1. lint-fix : d'abord, car il peut modifier des fichiers. Tout ce qui suit vérifie
#      donc le code tel qu'il sera commité.
#   2. check-types
#   3. tests unitaires
#   4. tests d'intégration (la base de test démarre seule)
#   5. builds
#   6. audit des dépendances de prod
#   7. tests end-to-end, sur la stack complète construite depuis le code actuel
#      (pnpm --filter @citadel/e2e stack-up). Arrêtée et vidée s'ils passent ; laissée
#      lancée s'ils échouent, pour relancer le test fautif sans tout reconstruire.
#
# Le résultat est gardé dans .local/validateAll.state (ignoré par Git) : succès ou échec,
# date, commit, et l'empreinte de ce qui a été validé (voir
# computeValidationFingerprint.sh : contenu des fichiers hors docs/ et .md, fichiers
# .env*, versions de Node et pnpm). Même empreinte qu'au dernier succès : rien à refaire.
#
# Limite assumée : ce qui vient de l'extérieur n'entre pas dans l'empreinte. Une
# vulnérabilité publiée depuis (étape 6) ou une image Docker de base mise à jour (étape
# 7) ne relance rien : --force est là pour ça.
#
# Pourquoi Git Bash : pnpm lance `bash`, qui sous PowerShell serait celui de WSL, sans
# Node ni pnpm. Le script s'arrête alors tout de suite, avec un message.

set -euo pipefail

STATE_FILE=.local/validateAll.state
SCRIPTS_DIR=scripts/validation

say() { printf '%s\n' "$*"; }
step() { printf '\n\033[1m== %s\033[0m\n' "$*"; }
die() {
	printf '\033[31mErreur : %s\033[0m\n' "$*" >&2
	exit 1
}

command -v pnpm >/dev/null || die "pnpm introuvable : lance validate-all depuis Git Bash (sous PowerShell, bash est celui de WSL)"

# Toujours depuis la racine du dépôt, d'où que pnpm lance le script
cd "$(git rev-parse --show-toplevel)"
source scripts/lib/prompt.sh

# -------------------------------------------------------------------------------------
# Options : --force, ou rien
force=""
case ${1:-} in
	--force) force=1 ;;
	"") ;;
	*) die "option inconnue : $1 (seule --force existe)" ;;
esac

# -------------------------------------------------------------------------------------
# Le dernier résultat : un fichier « clé=valeur », une par ligne

# readState <clé> -> la valeur, vide si le fichier ou la clé n'existe pas
readState() {
	[ -f "$STATE_FILE" ] || return 0
	sed -n "s/^$1=//p" "$STATE_FILE"
}

# writeState <success|failure> [empreinte]
writeState() {
	mkdir -p "$(dirname "$STATE_FILE")"
	{
		printf 'status=%s\n' "$1"
		printf 'date=%s\n' "$(date '+%Y-%m-%d %H:%M:%S')"
		printf 'commit=%s\n' "$(git rev-parse --short HEAD)"
		printf 'fingerprint=%s\n' "${2:-}"
	} >"$STATE_FILE"
}

computeFingerprint() {
	bash "$SCRIPTS_DIR/computeValidationFingerprint.sh"
}

# -------------------------------------------------------------------------------------
# Rien n'a changé depuis le dernier succès : on s'arrête là, sauf --force. Depuis un
# terminal et sans argument, la question est posée (Entrée : non, on ne relance pas).
# Sans terminal (pipe, CI), ou avec un argument, rien n'est demandé.
if [[ -z $force && $(readState status) == success && $(readState fingerprint) == "$(computeFingerprint)" ]]; then
	say "Déjà validé le $(readState date) (commit $(readState commit)), et rien n'a changé depuis."
	if [ $# -eq 0 ] && isInteractive && askConfirm "Relancer quand même ?" n; then
		say "On relance."
	else
		say "Rien à refaire. (pnpm validate-all --force pour relancer quand même)"
		exit 0
	fi
fi

# Un échec par défaut : si la validation s'arrête (étape en échec, Ctrl+C), c'est ce qui
# reste. Seule la toute fin écrit un succès.
writeState failure

# -------------------------------------------------------------------------------------
step "1. Lint (avec corrections)"
pnpm lint-fix

step "2. Types"
pnpm check-types

step "3. Tests unitaires"
pnpm -r test-unit

step "4. Tests d'intégration"
pnpm -r test-integration

step "5. Builds"
pnpm -r build

step "6. Audit des dépendances de prod"
pnpm audit:prod

step "7. Tests end-to-end"
# La stack locale (projet Compose citadel-local) : si pnpm prod:local tournait, elle est
# remplacée, les deux partagent le même projet
pnpm --filter @citadel/e2e stack-up
if ! pnpm --filter @citadel/e2e test-e2e; then
	say ""
	say "La stack e2e reste lancée, pour relancer un test sans tout reconstruire :"
	say "  pnpm --filter @citadel/e2e test-e2e -g \"<titre du test>\""
	say "  pnpm --filter @citadel/e2e test-e2e-report   (le rapport, avec traces et vidéos)"
	say "  pnpm --filter @citadel/e2e stack-down        (pour l'arrêter)"
	die "tests end-to-end en échec"
fi
pnpm --filter @citadel/e2e stack-down

# -------------------------------------------------------------------------------------
# L'empreinte est prise maintenant, pas au début : lint-fix a pu modifier des fichiers,
# et c'est leur état corrigé qui vient d'être validé
writeState success "$(computeFingerprint)"
step "Tout est validé"
