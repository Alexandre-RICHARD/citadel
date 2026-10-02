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
- Client Dev = 
```vite --open --port 3001
(!) Your Vite config uses features that are unsupported by `configLoader: 'native'`, which is planned to become the default in a future major version of Vite:
  - import "./projectDictionnary.type" without a file extension (src/react/appNavigation/projects.dictionnary.ts:1:41). Add the file extension
  - import "./projects.enum" without a file extension (src/react/appNavigation/projects.dictionnary.ts:2:30). Add the file extension
Set `VITE_CONFIG_NATIVE_IGNORE_WARNING=true` to suppress this warning.
[vite:react-swc] We recommend switching to `@vitejs/plugin-react` for improved performance as no swc plugins are used. More information at https://vite.dev/rolldown
```
- Dev du design system
```
file:///C:/Users/Alex/Hub/Centre/Dev/Citadel/apps/server/build/build.server.js:48
    var fs = require("fs");
             ^

ReferenceError: require is not defined in ES module scope, you can use import instead
This file is being treated as an ES module because it has a '.js' file extension and '\\?\C:\Users\Alex\Hub\Centre\Dev\Citadel\apps\server\package.json' contains "type": "module". To treat it as a CommonJS script, rename it to use the '.cjs' file extension.
    at ../../node_modules/.pnpm/dotenv@17.4.2/node_modules/dotenv/lib/main.js (file:///C:/Users/Alex/Hub/Centre/Dev/Citadel/apps/server/build/build.server.js:48:14)
    at __require (file:///C:/Users/Alex/Hub/Centre/Dev/Citadel/apps/server/build/build.server.js:18:52)
    at file:///C:/Users/Alex/Hub/Centre/Dev/Citadel/apps/server/build/build.server.js:73151:3
    at file:///C:/Users/Alex/Hub/Centre/Dev/Citadel/apps/server/build/build.server.js:73158:3
    at ModuleJob.run (node:internal/modules/esm/module_job:439:25)
    at async node:internal/modules/esm/loader:643:26
    at async asyncRunEntryPointWithESMLoader (node:internal/modules/run_main:101:5)
```
- Refonte du système de traduction
- Virer lucide-react
- Les media queries ne doivent jamais utilisées de rem, mais resté en taille d'écran abolsue à priori
