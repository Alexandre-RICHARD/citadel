#!/usr/bin/env bash
# =====================================================================================
# release.sh : lancé par `pnpm tools release`, sur ton PC, dans Git Bash
# =====================================================================================
#
#   pnpm tools release             demande « réelle » ou « simulation » ; la réelle valide, tague, pousse, attend les images, déploie
#   pnpm tools release --dry-run   la simulation directe : s'arrête juste avant de créer le tag, rien ne part
#
# Les étapes :
#   1. Vérifications : branche main, rien de non commité, pas de retard sur GitHub.
#   2. pnpm validate-all (la base de test et la stack e2e démarrent seules ; sauté si rien
#      n'a changé depuis sa dernière réussite). Si un fichier a changé pendant
#      la validation (lint-fix), arrêt : le commit tagué doit être celui qui a été validé.
#   3. Résumé : version en prod (demandée au NAS), commits qui partent, nouvelles
#      migrations, nom du tag. Puis ta confirmation.
#   4. Push de main et du tag, d'un seul coup : GitHub lance images.yml.
#   5. Attente des images : publiées sur ghcr.io, ou le workflow en échec.
#   6. ssh -t nas … citadel deploy <tag> : le NAS montre son plan et te redemande
#      confirmation. Jusque-là, rien n'a bougé sur le NAS.
#
# Pourquoi Git Bash : pnpm lance `bash`, qui sous PowerShell serait celui de WSL, sans tes
# clés SSH. Le tag suit la date, numéroté : v2026.10.25.01, puis v2026.10.25.02 le même jour.

set -euo pipefail

# Le dépôt sur GitHub, et le NAS : alias de ton ~/.ssh/config
REPOSITORY=Alexandre-RICHARD/citadel
NAS=nas
NAS_CITADEL=/Volume1/citadel/citadel
MIGRATIONS_DIR=apps/server/src/sql/migrations
# Les images, publiques : ghcr.io/alexandre-richard/citadel-<image>
GHCR_PATH=alexandre-richard/citadel-
# Attente des images : ghcr.io toutes les 10 s, 25 min au plus ; l'API de GitHub une
# fois sur 6 (toutes les minutes). Sans compte, elle accepte 60 appels par heure.
POLL_SECONDS=10
POLL_MAX=150
API_EVERY=6

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
source "$(dirname "$0")/lib/prompt.sh"
if [ $# -eq 0 ] && isInteractive; then
	askChoice "Quelle release ?" "Réelle : valide, tague, pousse, déploie" "Simulation (--dry-run) : s'arrête avant de créer le tag, rien ne part"
	[ "$CHOICE" = "2" ] && set -- --dry-run
fi
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
# Sa sortie n'est montrée qu'en cas d'échec : GitHub injoignable, ou un tag local qui
# diffère de celui de GitHub (« would clobber existing tag »)
fetch_output=$(git fetch --tags origin 2>&1) || die "git fetch a échoué :
$fetch_output"
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

# Nom du tag : la date du jour et un numéro, .01, puis .02… s'il existe déjà (ici ou
# sur GitHub)
base_tag="v$(date +%Y.%m.%d)"
number=1
tag=$(printf '%s.%02d' "$base_tag" "$number")
while git rev-parse --verify --quiet "refs/tags/$tag" >/dev/null ||
	[[ -n $(git ls-remote --tags origin "refs/tags/$tag") ]]; do
	number=$((number + 1))
	tag=$(printf '%s.%02d' "$base_tag" "$number")
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
# Deux sources, sans compte :
#   - ghcr.io : les images du tag y sont-elles toutes ? C'est ce qu'attend le NAS, et le
#     registre répond tout de suite ;
#   - l'API de GitHub : le lien du workflow, et surtout son échec (sinon on attendrait
#     25 min des images qui ne viendront pas). Elle garde ses réponses une minute en
#     cache : le paramètre t= (l'heure) en demande une fraîche à chaque appel.
api="https://api.github.com/repos/$REPOSITORY/actions/workflows/images.yml/runs?event=push&head_sha=$commit"
# Les images : la matrice d'images.yml, « image: [client, server, …] »
images=$(sed -n 's/^ *image: \[\(.*\)\]/\1/p' .github/workflows/images.yml | tr -d ' ' | tr ',' ' ')
[[ -n $images ]] || die "liste des images introuvable dans .github/workflows/images.yml"
total=$(wc -w <<<"$images")
scopes=""
for image in $images; do scopes+="&scope=repository:$GHCR_PATH$image:pull"; done
# Ce que le registre peut répondre pour une image (une par plateforme, ou leur index)
manifest_types="application/vnd.oci.image.index.v1+json, application/vnd.oci.image.manifest.v1+json"
manifest_types+=", application/vnd.docker.distribution.manifest.list.v2+json, application/vnd.docker.distribution.manifest.v2+json"

# Nombre d'images du tag déjà publiées. ghcr.io demande un jeton même pour une image
# publique : un jeton anonyme, en lecture, pour toutes d'un coup.
count_published() {
	local token image count=0
	# shellcheck disable=SC2016 # du JavaScript
	token=$(curl --silent --fail "https://ghcr.io/token?service=ghcr.io$scopes" |
		node -e 'let b = ""; process.stdin.on("data", (c) => (b += c)).on("end", () => console.log(JSON.parse(b).token));') ||
		{
			echo 0
			return
		}
	for image in $images; do
		curl --silent --fail --head --output /dev/null \
			--header "Authorization: Bearer $token" --header "Accept: $manifest_types" \
			"https://ghcr.io/v2/$GHCR_PATH$image/manifests/$tag" && count=$((count + 1))
	done
	echo "$count"
}

# Lit la réponse de l'API (JSON) avec Node, présent sur ton PC : « état résultat lien ».
# Les ${…} sont du JavaScript, pas du bash : d'où les apostrophes (et la directive suivante).
# shellcheck disable=SC2016
read_run='
let body = "";
process.stdin.on("data", (chunk) => (body += chunk)).on("end", () => {
	const run = (JSON.parse(body).workflow_runs ?? []).find((r) => r.head_branch === process.argv[1]);
	console.log(run ? `${run.status} ${run.conclusion ?? "-"} ${run.html_url}` : "absent - -");
});'
status="" conclusion="" url="" published=0 last_line="" shown_url=""
for ((poll = 0; poll < POLL_MAX; poll++)); do
	published=$(count_published)
	if ((poll % API_EVERY == 0)); then
		read -r status conclusion url < <(curl --silent --fail "$api&t=$(date +%s)" | node -e "$read_run" "$tag" || echo "erreur - -")
		[[ $url == - ]] && url=""
		if [[ -n $url && $url != "$shown_url" ]]; then
			say "  $url"
			shown_url=$url
		fi
		[[ $status != completed || $conclusion == success ]] ||
			die "images.yml a échoué ($conclusion) : $url. Le NAS n'a pas bougé ; corrige, commite, relance pnpm tools release"
	fi
	line="workflow $status, images publiées : $published/$total"
	if [[ $line != "$last_line" ]]; then
		say "  $(date +%H:%M:%S) $line"
		last_line=$line
	fi
	# Toutes les images sont là, ou GitHub dit le workflow réussi
	if ((published == total)) || [[ $conclusion == success ]]; then break; fi
	sleep "$POLL_SECONDS"
done
((published == total)) || [[ $conclusion == success ]] ||
	die "images.yml toujours pas fini après $((POLL_SECONDS * POLL_MAX / 60)) min : https://github.com/$REPOSITORY/actions"
say "  images $tag publiées sur ghcr.io"

# -------------------------------------------------------------------------------------
step "6. Déploiement sur le NAS"
# -t : un terminal sur le NAS, pour la confirmation [o/N] de citadel.
# Chemin complet : une commande lancée par SSH n'a pas le PATH de ta session.
ssh -t "$NAS" "$NAS_CITADEL deploy $tag"
