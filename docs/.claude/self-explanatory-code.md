---
name: self-explanatory-code
description: Le code s'explique par ses noms et de petites fonctions testées, pas par des commentaires qui paraphrasent
metadata:
  type: feedback
---

Pas de commentaires partout pour expliquer le code : un code bien nommé et découpé en petites briques testées se lit sans. Les commentaires restent pour le pourquoi et les règles métier délicates, pas pour paraphraser.

**Why:** dit le 2026-10-27 en demandant la factorisation vers `packages/common` : « on devrait pouvoir s'en passer juste parce que le code est bien écrit ».

**How to apply:** avant d'ajouter un commentaire, renommer ou extraire une fonction. Une fonction pure ne reste pas dans un composant : elle sort dans `common` (générique), `specs/…/helper/` (partagée front/serveur) ou le `helper/` de l'app, avec son test. Exception : les fichiers d'infra ([[infra-files-heavy-comments]]). Voir [[unit-test-naming-convention]].
