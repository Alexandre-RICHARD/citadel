---
name: unit-test-naming-convention
description: Règles d'écriture des tests unitaires et d'intégration, au-delà de ce que le lint impose (la structure est dans docs/architecture/architecture.md §2.3)
metadata:
  type: feedback
---

La structure imposée (`citadel/test-structure`, `vitest/consistent-test-it`) est décrite dans `docs/architecture/architecture.md` §2.3. Ce que le lint ne vérifie pas :
- `it`, jamais `test` ; titres en anglais ; chaque `it` dans exactement deux `describe` (fichier ou endpoint, puis groupe de comportement : « accepted values », « 201 Created »…).
- Un titre commence par « SHOULD … » et ajoute « WHEN … » seulement s'il y a une condition.
- Les chaînes `reason` interpolées dans les titres sont en anglais aussi : le lint ne voit que les parties statiques, les relire à la main.
- Les tests de `todo_folder` ne sont pas touchés.
- Un fichier PascalCase (classe) ne se teste pas directement : passer par une fabrique `createX`.

**Why:** l'utilisateur veut un arbre propre dans le rapport HTML de Vitest et aime le style SHOULD/WHEN.

**How to apply:** ne pas proposer un autre style de nommage sans lui demander. Voir [[self-explanatory-code]].
