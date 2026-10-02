- S'occuper de mutualiser les scripts npm

# Client
# Pour lancer ce projet :

## Prérequis
- Remplir le .env à partir du .env.example en cohérence avec le projet back
- Installer Node
- Activer corepack avec `corepack enable`

## Démarrage
- Installer les dépendances
- Exécuter le script `start`

# TODO

## Composant
- 

## Icons
- 

## Autres
- Règle Eslint
  - Tous les fichier scss doivent porter le même nom que le nom du dossier mais en camelCase
  - Un composant React n'a pas toujours de fichier scss lié
  - Un composant "principal" doit être nommé index.tsx et exporté une fonction React portant exactement le même nom que son dossier
  - Un composant "principal" peut avoir des sous-composant voisins qui devront eux avoir le même nom de fichier/export en PascalCase
    - Ils partageront le même fichier scss
  - Un dossier regroupant plusieurs composant
    - Ils sont tous dans leur sous-dossier, ce dossier est en camelCase
    - Ils sont tous à la racine avec juste un seul fichier tsx, le dossier est en PascalCase
  - Un fichier tsx doit se nommer exactement comme ce qu'il exporte
    - Sauf s'il est nommé index.tsx, auquel cas, ce qu'il exporte doit s'appeler exactement comme le nom du dossier parent direct
  - Aussi, tous les fichiers ts et tsx ne doivent exporter qu'une seule et unique chose
  - Le nom d'un dossier de composant est en PascalCase
  - Le nom d'un fichier de composant est en PascalCase sauf pour les index.tsx
  - Tous les autres fichiers doivent être en camelCase
  Exemple
    - src/
      - components/
        - Button/
          - index.tsx
          - ButtonIcon.tsx
          - button.module.scss
          - useButton.tsx
          - someHelper.ts
          - buttonVariant.enum.ts
          - ButtonIcons/
            - Arrow.tsx
            - Circle.tsx
            - Warn.tsx
          - ButtonWrapper/
            - index.tsx
            - buttonWrapper.module.scss
        - input/
          - InputText/
            - index.tsx
            - inputText.module.scss
          - InputNumber/
            - index.tsx
            - inputNumber.module.scss


# Server
# Pour lancer ce projet :

## Prérequis
- Remplir le .env à partir du .env.example en cohérence avec le projet front
- Installer MariaDB
- Installer Docker ou Docker Desktop
- Installer Node

## Démarrage
- Exécuter le script `init-db`
- Exécuter le script `migrate`
- Installer les dépendances
- Lancer avec `start`

# TODO
- Ajouter des tests (unitaire uniquement)
https://claude.ai/chat/9c73847f-79d7-4408-9eab-9601d0975968 
- On va faire des tesdt d'intégration sur toutes mes routes
- On va enfin implémenter le front
- On va créer le design system et un package common (ainsi que un package common par sous projet)
- On va faire des tests end to end
- Faire le système de tous est en 1 rem = 10px. Mais il faut y appliquer un système pour que l'utilisateur puisse "zoomer"
- Rendre précis le undefined. ? | undefined, ou les 2 mais le sens doit être différent
  - Préféré des valeurs null pour les input
  - En fait, c'est déjà activé. Préféré le fait de ne jamais avoir de type en undefined explicite. Une propriété optionnelle doit être marqué en ?. Une propriété qui peut être nulle doit être marqué en null.
- "Le build de HEAD correspond au mien (chunks identiques, CSS similaire, app à quasiment la même taille), donc l'absence de chunk vendor était déjà présente avant le design system. Je nettoie maintenant le worktree temporaire." Tu as dit ça, apparemment il y a un problème sur ou se trouve le code vendor
- Refaire entièrement le thème
- Refonte du système de traduction
- Virer lucide-react
- Les media queries ne doivent jamais utilisées de rem, mais resté en taille d'écran abolsue à priori
- Faire des data-portal avec tout les éléments de type : tooltip, modal, dropdown
- Voir si c'est possible d'avoir une seule commande pour tout le répo pour lancer la couverture des test avec coverage. Ca n'a pas trop de sens que plusieurs parties aient chacune leur coverage.
- Claude a répéré "Un bug repéré en passant dans DeathRow, non corrigé. Le champ de date est en datetime-local, mais toDateInputValue renvoie seulement AAAA-MM-JJ, une valeur que ce type de champ refuse. Le champ s'affiche donc vide, et enregistrer une mort sans toucher à la date remet son heure à minuit UTC. C'est à régler quand tu brancheras gameDeathCounter sur l'API."
- + point bonus : avec les collègues on a vu que c'était bien que les tests d'intégration ne nettoie pas leurs données de tests avant ou après l'exécution individuelle. La base ne doit être clean qu'au tout début des tests. Cela permet de s'assurer d'une meilleure compatibilité des endpoints les uns par rapport aux autres. Aussi, pour renforcer ça, les tests d'intégration doivent être joué dans un ordre aléatoire à chaque fois. Si un test échoue une fois, soit il est mal conçu, soit il a révélé une faille entre plusieurs endpoints.
