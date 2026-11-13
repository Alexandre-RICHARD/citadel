---
name: infra-files-heavy-comments
description: Fichiers d'infra et de CI/CD (Dockerfile, compose, scripts, workflows, Caddyfile, nginx) très commentés en français ; jamais de secret versionné
metadata:
  type: feedback
---

Chaque fichier d'infra ou de CI/CD que je crée (Dockerfile, compose, scripts bash, workflows GitHub, Caddyfile, nginx, crontab…) est commenté presque partout, en expliquant le **pourquoi** et le **comment**. Plus de commentaires que de code est acceptable. En français, comme le reste du dépôt.

Jamais de secret ni de vraie valeur de `.env` dans un fichier versionné. Pour tester avec une clé (curl vers un fournisseur), ne jamais afficher la clé et passer le JSON par fichier pour garder l'UTF-8.

**Why:** l'utilisateur dit (2026-10-25) qu'il doit comprendre chaque fichier écrit pour le NAS et le CI/CD ; il n'est pas à l'aise avec Docker et l'outillage infra, et maintiendra seul.

**How to apply:** cela l'emporte sur [[self-explanatory-code]] pour l'infra seulement. Expliquer l'intention, les options non évidentes, les choix de sécurité et les pièges, dans le fichier. Le code applicatif (`apps/*`) garde ses conventions.
