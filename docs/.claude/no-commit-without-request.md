---
name: no-commit-without-request
description: Jamais de git commit dans Citadel sans demande explicite de l'utilisateur pour ce commit
metadata:
  type: feedback
---

Ne jamais faire de commit sans une demande explicite de l'utilisateur pour CE commit. Une demande de commit passée ne vaut pas pour les changements suivants.

**Why:** le 2026-10-03, après avoir commité l'étape 1 à sa demande, j'ai commité de moi-même un changement non validé. Il veut relire et décider ce qui entre dans l'historique, qu'il souhaite propre.

**How to apply:** finir le travail, vérifier (types, lint, tests ciblés), laisser les changements dans le working tree et proposer un découpage en commits ; ne lancer `git commit` qu'après son accord. Quand il demande des commits, les découper par fonctionnalité, avec des messages en français (« Infra : … », « Console : … »). Exception : une liste de corrections où il a dit explicitement « tu commites après ma validation » vaut pour cette liste seulement. Voir [[no-claude-coauthor]].
