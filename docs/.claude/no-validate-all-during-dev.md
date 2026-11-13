---
name: no-validate-all-during-dev
description: En dev, ne jamais lancer pnpm validate-all ; lint -r, check-types -r et seulement les tests concernés
metadata:
  type: feedback
---

Pendant le développement, pas de `pnpm validate-all`. Lancer seulement `pnpm -r lint`, `pnpm -r check-types` et les tests concernés par le changement (unitaires, intégration ou e2e de la zone touchée).

**Why:** validate-all est lent et ralentissait les réponses. C'est le script d'avant mise en prod, que l'utilisateur lance lui-même quand le dev est fini.

**How to apply:** après chaque changement, vérifications ciblées. Ne lancer validate-all que sur demande explicite. Ne jamais lancer de tests d'intégration pendant qu'un validate-all tourne : la base de test partagée est recréée.
