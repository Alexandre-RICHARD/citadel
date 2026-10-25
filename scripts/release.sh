#!/usr/bin/env bash
# =====================================================================================
# release.sh : lancé par `pnpm release`, sur ton PC, dans Git Bash (cahier des charges, §8.1)
# =====================================================================================
#
#   pnpm release             valide, tague, pousse, attend les images, déploie
#   pnpm release --dry-run   s'arrête juste avant de créer le tag : rien ne part
#
# Les étapes :
#   1. Vérifications : branche main, rien de non commité, pas de retard sur GitHub.
#   2. pnpm validate-all (la base de test démarre seule). Si un fichier a changé pendant
#      la validation (lint-fix), arrêt : le commit tagué doit être celui qui a été validé.
#   3. Résumé : version en prod (demandée au NAS), commits qui partent, nouvelles
#      migrations, nom du tag. Puis ta confirmation.
#   4. Push de main et du tag, d'un seul coup : GitHub lance images.yml.
#   5. Attente des images, en suivant le workflow par l'API publique de GitHub.
#   6. ssh -t nas … citadel deploy <tag> : le NAS montre son plan et te redemande
#      confirmation. Jusque-là, rien n'a bougé sur le NAS.
#
# Pourquoi Git Bash : pnpm lance `bash`, qui sous PowerShell serait celui de WSL, sans tes
# clés SSH. Le tag suit la date : v2026.10.25, puis v2026.10.25.2 le même jour.

set -euo pipefail

# Le dépôt sur GitHub, et le NAS : alias de ton ~/.ssh/config (§8.1, étape 6 de la roadmap)
REPOSITORY=Alexandre-RICHARD/citadel
NAS=nas
NAS_CITADEL=/Volume1/citadel/citadel
MIGRATIONS_DIR=apps/server/src/sql/migrations
# Attente des images : un appel à l'API toutes les 30 s, 25 min au plus. GitHub accepte
# 60 appels par heure sans compte : on reste en dessous.
POLL_SECONDS=30
POLL_MAX=50

say() { printf '%s\n' "$*"; }
step() { printf '\n\033[1m== %s\033[0m\n' "$*"; }
die() {
	printf '\033[31mErreur : %s\033[0m\n' "$*" >&2
	exit 1
}

# Seul « o » (ou « oui ») continue
confirm() {
	local answer=""
	printf '\n%s ' "$1"
	read -r answer || true
	[[ $answer =~ ^[oO](ui)?$ ]] || die "annulé : rien n'est parti"
}

dry_run=""
case ${1:-} in
	--dry-run) dry_run=1 ;;
	"") ;;
	*) die "option inconnue : $1 (seule --dry-run existe)" ;;
esac

# Toujours depuis la racine du dépôt, d'où que pnpm lance le script
cd "$(git rev-parse --show-toplevel)"

# -------------------------------------------------------------------------------------
step "1. Vérifications"
[[ $(git rev-parse --abbrev-ref HEAD) == main ]] || die "pas sur la branche main"
[[ -z $(git status --porcelain) ]] || die "des changements ne sont pas commités (git status)"
git fetch --quiet --tags origin || die "GitHub injoignable (git fetch)"
if git rev-parse --verify --quiet origin/main >/dev/null; then
	behind=$(git rev-list --count HEAD..origin/main)
	((behind == 0)) || die "main a $behind commit(s) de retard sur GitHub : git pull d'abord"
fi
say "  main, propre, à jour"

# -------------------------------------------------------------------------------------
step "2. Validation : pnpm validate-all"
pnpm validate-all
if [[ -n $(git status --porcelain) ]]; then
	git status --short
	die "validate-all a modifié des fichiers (lint-fix) : relis-les, commite, puis relance"
fi

# -------------------------------------------------------------------------------------
step "3. Résumé"
# Le NAS répond par la version en service (citadel version). Injoignable : on continue,
# le déploiement de l'étape 6 le dira de toute façon.
prod_version=$(ssh -o ConnectTimeout=10 "$NAS" "$NAS_CITADEL version" 2>/dev/null || true)
say "  En prod : ${prod_version:-inconnue (NAS injoignable, ou rien de déployé)}"

# Nom du tag : la date du jour, suffixée .2, .3… s'il existe déjà (ici ou sur GitHub)
base_tag="v$(date +%Y.%m.%d)"
tag=$base_tag
suffix=2
while git rev-parse --verify --quiet "refs/tags/$tag" >/dev/null ||
	[[ -n $(git ls-remote --tags origin "refs/tags/$tag") ]]; do
	tag="$base_tag.$suffix"
	suffix=$((suffix + 1))
done
say "  Tag : $tag"

# Ce qui part : depuis le tag en prod s'il est connu, sinon les 10 derniers commits
if [[ -n $prod_version ]] && git rev-parse --verify --quiet "refs/tags/$prod_version" >/dev/null; then
	range="$prod_version..HEAD"
	say ""
	say "  Commits depuis $prod_version :"
	git log --oneline "$range" | sed 's/^/    /'
	say ""
	say "  Nouvelles migrations :"
	new_migrations=$(git diff --name-only --diff-filter=A "$range" -- "$MIGRATIONS_DIR")
	say "${new_migrations:-    aucune}" | sed 's/^\([^ ]\)/    \1/'
else
	say ""
	say "  Derniers commits (version en prod inconnue) :"
	git log --oneline -10 | sed 's/^/    /'
fi

if [[ -n $dry_run ]]; then
	say ""
	say "Essai (--dry-run) : arrêt ici. Aucun tag, aucun push."
	exit 0
fi
confirm "Pousser main et le tag $tag, puis déployer ? [o/N]"

# -------------------------------------------------------------------------------------
step "4. Push de main et de $tag"
git tag --annotate "$tag" --message "Release $tag"
# --atomic : main et le tag partent ensemble, ou aucun des deux
if ! git push --atomic origin main "refs/tags/$tag"; then
	git tag --delete "$tag" >/dev/null
	die "push refusé : le tag local a été supprimé, rien n'est parti"
fi
commit=$(git rev-parse HEAD)

# -------------------------------------------------------------------------------------
step "5. Construction des images par GitHub"
api="https://api.github.com/repos/$REPOSITORY/actions/workflows/images.yml/runs?event=push&head_sha=$commit"
# Lit la réponse de l'API (JSON) avec Node, présent sur ton PC : « état résultat lien ».
# Les ${…} sont du JavaScript, pas du bash : d'où les apostrophes (et la directive suivante).
# shellcheck disable=SC2016
read_run='
let body = "";
process.stdin.on("data", (chunk) => (body += chunk)).on("end", () => {
	const run = (JSON.parse(body).workflow_runs ?? []).find((r) => r.head_branch === process.argv[1]);
	console.log(run ? `${run.status} ${run.conclusion ?? "-"} ${run.html_url}` : "absent - -");
});'
last_status=""
for ((poll = 1; poll <= POLL_MAX; poll++)); do
	read -r status conclusion url < <(curl --silent --fail "$api" | node -e "$read_run" "$tag" || echo "erreur - -")
	[[ $url == - ]] && url=""
	if [[ $status != "$last_status" ]]; then
		say "  $(date +%H:%M:%S) $status $url"
		last_status=$status
	fi
	if [[ $status == completed ]]; then
		[[ $conclusion == success ]] ||
			die "images.yml a échoué ($conclusion) : $url. Le NAS n'a pas bougé ; corrige, commite, relance pnpm release"
		break
	fi
	sleep "$POLL_SECONDS"
done
[[ $status == completed ]] || die "images.yml toujours pas fini après $((POLL_SECONDS * POLL_MAX / 60)) min : https://github.com/$REPOSITORY/actions"
say "  images $tag publiées sur ghcr.io"

# -------------------------------------------------------------------------------------
step "6. Déploiement sur le NAS"
# -t : un terminal sur le NAS, pour la confirmation [o/N] de citadel.
# Chemin complet : une commande lancée par SSH n'a pas le PATH de ta session.
ssh -t "$NAS" "$NAS_CITADEL deploy $tag"
