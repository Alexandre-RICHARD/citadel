#!/usr/bin/env bash
# Fabrique ADMIN_PASSWORD_HASH (argon2id), à coller dans .env.prod ou infra/compose.local.env.
# Usage : pnpm tools hashAdminPassword
# Le mot de passe est tapé deux fois, sans s'afficher, et n'est écrit nulle part. Sur le NAS : citadel admin-password.

set -euo pipefail

# Le programme vit dans la console (apps/admin) : il se lance depuis son dossier
cd "$(dirname "$0")/../apps/admin"
pnpm --silent exec tsx src/server/auth/hashPasswordCli.ts
