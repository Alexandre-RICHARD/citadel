---
name: docs-organization
description: Comment je rédige et tiens à jour les docs de Citadel : gabarit, un dossier par sujet, tâches dans le todo, doc synchronisée avec le code
metadata:
  type: feedback
---

Depuis le 2026-11-13, les docs sont des références **complètes et vérifiées**, pas courtes : l'utilisateur ne les relit qu'en cas de besoin, elles doivent être justes et faciles à retrouver. Chaque fait est vérifié dans le code ; décisions et pourquoi sont gardés ; l'historique de construction (roadmaps, [toi]/[moi], phases) ne l'est pas.

Règles d'écriture :
- Chaque `.md` est dans `docs/<sujet>/<sujet>.md` (e2e : `e2e`, `scenarios`, `auth_verifications`), sauf le `README.md` racine qui les indexe tous.
- Gabarit : `# Titre`, fil d'Ariane `[Citadel](../../README.md) › …`, intro de 1 à 2 phrases (ce que le fichier contient ou non, avec liens), `## Sommaire` avec ancres, titres numérotés `## 1. …` / `### 1.1 …`, pas de deux-points dans les titres, pas de séparateurs `---`.
- Explications et tâches strictement séparées : toute tâche va dans `docs/todo/todo.md`, par grand sujet puis thème (« Auth > TOTP »), ⚠️ sur les prioritaires, sous-section « Écarté » en fin de sujet, dernière section « À vérifier hors du dépôt » (NAS, Brevo, Cloudflare, Bitwarden).
- Des commentaires de code citent des sections (`docs/todo/todo.md` §8, `docs/auth/auth.md` §3.1 et §8.3, `docs/e2e/e2e.md`, `docs/e2e/auth_verifications.md`) : garder ces numéros stables. Les migrations SQL V021/V022 citent l'ancien « cahier de l'authentification, §1.2 » (non modifiables : checksums Flyway) ; `auth.md` §1.2 « Mise en place » y correspond. N'ajouter aucune référence vers une section supprimée.
- Tout ce qui reste à traiter (bugs, incohérences, simples idées) va dans `docs/todo/todo.md`, jamais dans une autre liste : `docs/problems/problems.md` a été supprimé une fois traité, ne pas le recréer. L'utilisateur priorise lui-même : ne pas ajouter de ⚠️ de ma propre initiative.
- Le README n'a pas de section « Contribuer » et n'invite pas à ouvrir des PR : le dépôt est ouvert, sans appel à contribution.
- Ne pas déplacer ni rassembler des notes que l'utilisateur a placées là où elles sont (ex. les idées Satisfactory dans le todo, qui sont de fait des tâches).

**Why:** « je ne vais jamais les relire sauf si besoin défini… être juste et organisé pour avoir des informations véritables et facilement retrouvables » (2026-11-13). Cela remplace la règle « docs courtes, sans arborescence ni liste d'endpoints » de [[spec-doc-editing]].

**How to apply:** quand le code change, mettre à jour la section de doc et l'entrée du todo correspondantes ; nouveau projet = `docs/<projet>/<projet>.md` au même gabarit et une ligne dans l'index du README ; vérifier les liens par script après une grosse édition. Ce qui décrit le projet va dans la doc, jamais dans cette mémoire. Éditer selon [[spec-doc-editing]].
