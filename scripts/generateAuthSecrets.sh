#!/usr/bin/env bash
# Tire au sort les clés secrètes de l'authentification : 32 octets aléatoires, en hexadécimal (64 caractères).
# Usage : pnpm tools generateAuthSecrets
# Ne les écrit nulle part : copie-les dans Bitwarden, puis dans .env.prod. À refaire = tout casser :
# changer AUTH_TOTP_ENCRYPTION_KEY rend illisibles les secrets de double authentification déjà enregistrés
# (une rotation passe par AUTH_TOTP_PREVIOUS_ENCRYPTION_KEY et une nouvelle version, voir le cahier de l'auth).

set -euo pipefail

source "$(dirname "$0")/lib/prompt.sh"

if isInteractive; then
	echo "Attention : ces clés ne sont affichées qu'une fois et ne sont enregistrées nulle part."
	echo "Changer plus tard AUTH_TOTP_ENCRYPTION_KEY rend illisibles les secrets de double authentification déjà enregistrés."
	askConfirm "Tirer de nouvelles clés ?" o || { echo "Annulé."; exit 0; }
fi

randomKey() {
	node -e "process.stdout.write(require('node:crypto').randomBytes(32).toString('hex'))"
}

echo "# Colle ces lignes dans Bitwarden, puis dans .env.prod (un seul tirage : ne relance pas pour les « choisir »)"
echo "AUTH_CODE_HMAC_KEY=$(randomKey)"
echo "AUTH_TOTP_ENCRYPTION_KEY=$(randomKey)"
echo "AUTH_TOTP_ENCRYPTION_KEY_VERSION=1"
