---
name: email-vocabulary
description: On écrit toujours « email » (jamais « mail » ni « e-mail ») dans l'interface, les commentaires et les docs
metadata:
  type: feedback
---

Le mot est « email » partout où on écrit du français ou de l'anglais lisible : textes d'interface, commentaires, docs, titres de tests, messages. Jamais « mail » seul, jamais « e-mail ». Au pluriel « emails » ; avec élision « l'email », « d'email », « cet email », « de l'email » (jamais « du mail »).

**Why:** décidé le 2026-11-13 par l'utilisateur après l'audit des docs : un seul mot, pour l'uniformité. Appliqué ce jour-là à tout le dépôt (docs, commentaires, textes visibles, dossier `docs/emails/`).

**How to apply:** les identifiants du code ne changent pas (type `Mail`, `mailing_*`, `MAIL_*`, `/mail/status`, `loginMethods: "mail"`, icône `Mail` de lucide) ; les noms propres non plus (Gmail, Mailpit, mail-tester). Les messages d'erreur anglais du serveur et les titres de tests anglais gardent « mail » tant qu'ils n'ont pas été touchés : en les modifiant, passer à « email ». Après une édition de doc ou de commentaires, repérer les restes avec une recherche de `\bmails?\b` hors code.
