---
name: vouvoiement-ui
description: Tout texte d'interface et toute doc vouvoient ; seuls les gabarits d'emails tutoient
metadata:
  type: feedback
---

Le tutoiement n'existe que dans les emails. Le site, la console d'administration, les messages d'erreur affichés et les citations de textes d'interface dans les docs vouvoient (« Votre profil », « Protégez votre compte », « Il vous reste… »). La règle est aussi dans `docs/architecture/architecture.md` §2.1.

**Why:** décidé le 2026-11-13 par l'utilisateur pour simplifier : un seul registre partout sauf dans les emails. Il m'a autorisé à modifier le code pour l'appliquer (fait : client, console admin, tests e2e et unitaires, docs).

**How to apply:** écrire tout nouveau texte d'interface et toute doc au vouvoiement, y compris les impératifs (« Saisissez », « Patientez »). Quand une doc cite un email (objet, phrase), garder son tutoiement : ne pas « corriger » un email ni son test. Les commentaires de code et les messages des scripts d'infra n'ont pas été convertis (non décidé).

Réaffirmé le 2026-11-13 : aucune exception au vouvoiement dans l'interface, même si l'idée a été envisagée (« trop galère pour aucun intérêt »). Des textes tutoyés avaient survécu au commit de conversion (« demande un nouvel email », « réessaie », « refais-en », « Patiente », « tape ») : après une conversion, chercher aussi les impératifs en `-e` / `-s` dans les `.tsx`, les `*ErrorReasons`, la console (`apps/admin`) et les tests e2e qui les citent.
