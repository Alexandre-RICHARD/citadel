#!/usr/bin/env bash
# Questions posées dans le terminal, partagées par les scripts de scripts/ (à charger avec `source`).
# Règle de la maison : un script qui a des options, des choix, des avertissements ou des confirmations
# les pose lui-même quand on le lance sans argument depuis un terminal (pnpm tools <nom>).
# Avec des arguments, ou sans terminal (pipe, CI), il reste non interactif : rien n'est jamais demandé dans le vide.

# Vrai quand quelqu'un peut répondre
isInteractive() {
	[ -t 0 ] && [ -t 1 ]
}

# askConfirm "Question ?" [o|n]   -> code 0 si oui. Le 2e argument est la réponse par défaut (n sans lui)
askConfirm() {
	local question="$1" default="${2:-n}" hint answer=""
	[ "$default" = "o" ] && hint="[O/n]" || hint="[o/N]"
	read -r -p "$question $hint " answer || true
	answer="${answer:-$default}"
	[[ "$answer" =~ ^[oO](ui)?$ ]]
}

# askChoice "Question ?" "Choix 1" "Choix 2"...   -> écrit le NUMÉRO choisi (1, 2…) dans CHOICE ; 1 par défaut (Entrée)
askChoice() {
	local question="$1" index=1 answer=""
	shift
	echo "$question"
	for option in "$@"; do
		echo "  $index) $option"
		index=$((index + 1))
	done
	while true; do
		read -r -p "Ton choix [1] : " answer || true
		answer="${answer:-1}"
		if [[ "$answer" =~ ^[0-9]+$ ]] && [ "$answer" -ge 1 ] && [ "$answer" -le "$#" ]; then
			CHOICE="$answer"
			return
		fi
		echo "Réponds par un numéro entre 1 et $#."
	done
}

# askText "Question ?" "valeur par défaut"   -> écrit la réponse dans TEXT
askText() {
	local question="$1" default="${2:-}" answer=""
	read -r -p "$question [${default}] : " answer || true
	TEXT="${answer:-$default}"
}
