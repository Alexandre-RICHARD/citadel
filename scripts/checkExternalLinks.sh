#!/usr/bin/env bash
# Teste chaque lien du dictionnaire des liens externes (packages/specs/src/links/externalLinks.ts) : un lien
# qui ne répond plus se corrige dans ce fichier. À lancer de temps en temps ; demande Internet.
#
# Pour chaque lien : le code HTTP final (après redirections) et, si le lien a été redirigé ailleurs, où il arrive.
#   OK         réponse 2xx
#   REDIRIGÉ   réponse 2xx, mais à une autre adresse : le dictionnaire peut pointer directement dessus
#   À VÉRIFIER 401, 403, 429 : le site refuse les outils automatiques (IGDB répond 403 à curl) ; à ouvrir à la main
#   CASSÉ      404, 5xx, ou aucune réponse : à corriger
# Les adresses mailto: ne se testent pas. Le code de sortie vaut 1 s'il y a au moins un lien CASSÉ.
# Usage : pnpm tools checkExternalLinks

set -euo pipefail

root="$(realpath "$(dirname "$0")/..")"
dictionary="$root/packages/specs/src/links/externalLinks.ts"

# Un navigateur courant : certains sites refusent l'agent de curl
userAgent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36"
timeoutSeconds=20

mapfile -t urls < <(grep -oE '"https?://[^"]+"' "$dictionary" | tr -d '"')

if [ "${#urls[@]}" -eq 0 ]; then
	echo "Aucun lien trouvé dans $dictionary" >&2
	exit 1
fi

broken=0
toCheck=0
redirected=0

for url in "${urls[@]}"; do
	# -L suit les redirections ; %{url_effective} est l'adresse où l'on arrive. Sans réponse : code 000
	result="$(curl -s -L -A "$userAgent" -o /dev/null --max-time "$timeoutSeconds" -w "%{http_code} %{url_effective}" "$url" || true)"
	code="${result%% *}"
	finalUrl="${result#* }"

	case "$code" in
		2??)
			# Une barre finale en plus ou en moins ne compte pas pour une redirection
			if [ "${finalUrl%/}" = "${url%/}" ]; then
				echo "OK          $code  $url"
			else
				echo "REDIRIGÉ    $code  $url"
				echo "                   -> $finalUrl"
				redirected=$((redirected + 1))
			fi
			;;
		401 | 403 | 429)
			echo "À VÉRIFIER  $code  $url"
			toCheck=$((toCheck + 1))
			;;
		*)
			echo "CASSÉ       $code  $url"
			broken=$((broken + 1))
			;;
	esac
done

echo
echo "${#urls[@]} liens : $broken cassés, $toCheck à vérifier à la main, $redirected redirigés."
[ "$broken" -eq 0 ]
