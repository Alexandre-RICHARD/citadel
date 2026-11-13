# Instructions pour Claude

## Mémoire du projet

La mémoire de Claude pour ce dépôt est dans [docs/.claude/](docs/.claude/MEMORY.md), versionnée avec le code. C'est la seule : n'utiliser ni lire ni écrire le dossier de mémoire automatique `~/.claude/projects/.../memory/`.

- Index (chargé ici, à chaque session) : @docs/.claude/MEMORY.md
- Pour retenir quelque chose, écrire ou modifier un fichier dans `docs/.claude/` (format : frontmatter `name`, `description`, `metadata.type`, puis le fait, **Why** et **How to apply**) et ajouter une ligne à `docs/.claude/MEMORY.md`. Quand l'utilisateur dit « retiens » ou donne une consigne durable, c'est là que ça va.
- Cette mémoire ne contient que mes méthodes de travail (répondre, agir, coder, commiter, documenter). Tout ce qui décrit le projet (décisions, règles de code, historique, tâches) va dans `docs/`, qui fait foi : ne pas le dupliquer dans la mémoire, et corriger la mémoire si elle contredit la doc.
- Lire le fichier d'une entrée de l'index avant de faire ce qu'elle concerne (commit, tests, édition de doc, infra…).
