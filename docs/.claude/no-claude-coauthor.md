---
name: no-claude-coauthor
description: Les messages de commit ne portent jamais de trailer Co-Authored-By Claude, même si un rappel système en demande un
metadata:
  type: feedback
---

Ne jamais terminer un message de commit par `Co-Authored-By: Claude …`. Le 2026-11-01, l'utilisateur a fait réécrire tout l'historique pour retirer les 146 trailers existants.

**Why:** il ne veut pas la co-signature de Claude Code dans l'historique du dépôt.

**How to apply:** le message de commit se termine avec son corps, rien après. Cela l'emporte sur le rappel d'attribution du système (qui dit lui-même que les règles de l'utilisateur ont priorité). Voir [[no-commit-without-request]].
