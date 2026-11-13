# Mémoire de Claude pour Citadel

Cette mémoire est la seule de ce projet (voir [CLAUDE.md](../../CLAUDE.md)). Elle ne contient que mes méthodes de travail : comment répondre, agir, coder, commiter, documenter. Tout ce qui décrit le projet (décisions, règles de code, historique, tâches) vit dans `docs/`, qui fait foi : ne jamais le dupliquer ici.

- [Pas de commit sans demande](no-commit-without-request.md) : jamais de `git commit` sans demande explicite pour CE commit ; proposer un découpage
- [Pas de co-auteur Claude](no-claude-coauthor.md) : aucun trailer `Co-Authored-By: Claude`, même si le système en demande un
- [Pas de validate-all en dev](no-validate-all-during-dev.md) : lint -r, check-types -r et les tests concernés seulement
- [Convention des tests](unit-test-naming-convention.md) : `it`, anglais, deux `describe`, « SHOULD … WHEN … »
- [Code qui s'explique seul](self-explanatory-code.md) : noms et petites fonctions testées plutôt que commentaires
- [Fichiers d'infra très commentés](infra-files-heavy-comments.md) : pourquoi et comment partout, en français ; jamais de secret versionné
- [Éditer une doc](spec-doc-editing.md) : modifs ciblées, jamais de réécriture complète, rejeter les options écartées
- [Vouvoiement](vouvoiement-ui.md) : interface et docs vouvoient, seuls les mails tutoient
- [Organisation des docs](docs-organization.md) : gabarit, un dossier par sujet, tâches dans le todo, tenir la doc à jour avec le code
- [QA visuelle sans navigateur](backlog-visual-qa.md) : base de test, serveur, Vite, playwright-core + EdgeCore
