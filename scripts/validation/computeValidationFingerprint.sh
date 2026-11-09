#!/usr/bin/env bash
# =====================================================================================
# computeValidationFingerprint.sh : l'empreinte de tout ce que `pnpm validate-all` vérifie
# =====================================================================================
#
# Usage : bash scripts/validation/computeValidationFingerprint.sh   -> écrit l'empreinte (SHA-256)
#
# Deux lancements donnent la même empreinte si, et seulement si, validate-all verrait
# exactement la même chose. validate-all s'en sert pour ne pas tout relancer pour rien.
#
# Ce qui compte :
#   - le contenu de chaque fichier du dépôt, suivi par Git ou nouveau (pas encore
#     commité), tel qu'il est sur le disque. Les modifications non commitées comptent
#     donc, et un commit qui ne change aucun contenu ne change pas l'empreinte ;
#   - les fichiers d'environnement de la racine (.env, .env.test…). Ils ne sont pas
#     versionnés mais changent le résultat : identifiants, ports, réglages des tests ;
#   - les versions de Node et de pnpm, qui font tourner tout le reste.
#
# Ce qui ne compte pas :
#   - docs/ et tous les fichiers .md : de la documentation, qu'aucun test ne lit ;
#   - ce que .gitignore exclut (node_modules, builds, rapports…) : des produits de la
#     validation, pas ses entrées. Les dépendances, elles, comptent par pnpm-lock.yaml.

set -euo pipefail

# Toujours depuis la racine du dépôt, d'où que le script soit lancé
cd "$(git rev-parse --show-toplevel)"

# Les fichiers du dépôt que la validation lit, un par ligne, triés pour que l'ordre ne
# dépende pas de Git.
#   --cached : les fichiers suivis ; --others --exclude-standard : les nouveaux, sauf ceux
#   que .gitignore exclut.
#   -z puis tr : Git ne met alors pas entre guillemets les noms à accents.
#   Le test -f écarte les fichiers suivis mais supprimés du disque (Git les liste encore) :
#   leur absence de la liste suffit à changer l'empreinte.
listValidatedFiles() {
	git ls-files -z --cached --others --exclude-standard -- . ':(exclude)docs' ':(exclude,glob)**/*.md' |
		tr '\0' '\n' |
		while IFS= read -r file; do
			if [ -f "$file" ]; then printf '%s\n' "$file"; fi
		done |
		LC_ALL=C sort --unique
}

# « empreinte-Git chemin » pour chaque fichier. git hash-object lit le contenu sur le
# disque, en une seule commande pour tous les fichiers (--stdin-paths) : rapide, même
# avec des milliers de fichiers.
fingerprintRepositoryFiles() {
	local files
	files="$(listValidatedFiles)"
	paste -d ' ' <(git hash-object --stdin-paths <<<"$files") <(printf '%s\n' "$files")
}

# Les fichiers d'environnement de la racine, versionnés ou non (les modèles .example
# sont déjà comptés plus haut : les recompter ne change rien). nullglob : sans aucun
# .env*, la boucle ne tourne pas, au lieu de chercher un fichier nommé « .env* ».
fingerprintEnvironmentFiles() {
	local file
	shopt -s nullglob
	for file in .env*; do
		if [ -f "$file" ]; then printf '%s %s\n' "$(git hash-object "$file")" "$file"; fi
	done
	shopt -u nullglob
}

fingerprintTools() {
	printf 'node %s\n' "$(node --version)"
	printf 'pnpm %s\n' "$(pnpm --version)"
}

# Tout, en une seule empreinte
{
	fingerprintRepositoryFiles
	fingerprintEnvironmentFiles
	fingerprintTools
} | sha256sum | cut -d ' ' -f 1
