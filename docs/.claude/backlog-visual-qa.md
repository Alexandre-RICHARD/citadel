---
name: backlog-visual-qa
description: Comment lancer et piloter l'interface en headless sur cette machine : base de test remplie en SQL, serveur avec .env.test, Vite, playwright-core + EdgeCore
metadata:
  type: reference
---

Pas de MCP navigateur ni de Chrome/Edge classique ici : le seul Chromium est `C:\Program Files (x86)\Microsoft\EdgeCore\<version>\msedge.exe` (la version change avec Edge : lister le dossier d'abord, 156.0.4314.58 le 2026-11-06). Il tourne en headless avec `playwright-core` installé dans le scratchpad et passé en `executablePath` (playwright-core 1.49 échoue avec EdgeCore 156, 1.55 marche).

Recette :
- Ne jamais migrer la base de dev de l'utilisateur pour une vérification (des migrations non relues casseraient les checksums Flyway). Utiliser le conteneur jetable `citadel-dev-mariadb-test-1` (port 3308, migré par `pnpm test:integration`), rempli en SQL : `docker exec -i … sh -c 'mariadb -uroot -p"$MARIADB_ROOT_PASSWORD" citadel_test' < seed.sql`.
- Serveur : `npx tsx --env-file=../../.env.test ./src/index.ts` dans `apps/server` (port 3000 ; ids IGDB factices, donc les endpoints IGDB répondent 502, ce qui teste aussi l'affichage d'erreur). Client : `npx vite --port 3001 --strictPort` dans `apps/client`.
- Les `Select` du Backlog sont `role="combobox"` ; Escape vide les `type="search"` nativement.
- Arrêter les tâches de fond laisse les enfants node vivants : tuer les PID qui écoutent sur 3000/3001 ensuite (`taskkill //PID … //F //T`).
- La base de test est celle des tests d'intégration (des centaines d'utilisateurs, 188 jeux) : un compte de QA se supprime à la main dans l'ordre des clés étrangères (done_dlc → user_version → user_game → series → auth_user).
- `.env.test` a `MAIL_SENDER=memory` et pas d'`AUTH_COOKIE_SECURE` (le cookie `__Host-citadel_session` marche sur localhost dans Chromium). Pour lire les emails de l'extérieur : un wrapper tsx dans le scratchpad (même `--env-file`) qui importe `apps/server/src/app.ts` et `mail/sender/memoryMailSender.ts` par URL `file:///` et sert `/__mails` sur le port 3000 avant de déléguer à `app` ; les limiteurs en mémoire se remettent à zéro en redémarrant. Une connexion avec TOTP demande un code calculé sur l'horloge réelle (±1 pas, rejeu refusé).

**Why:** ce procédé a trouvé des bugs que nul test n'avait vus (boucle de rendu, formulaire initialisé depuis un cache périmé).

**How to apply:** à utiliser pour valider une interface sans demander à l'utilisateur. Les parcours e2e officiels sont dans `docs/e2e/e2e.md`.
