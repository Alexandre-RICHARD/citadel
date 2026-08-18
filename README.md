# Pour lancer ce projet :

## Prérequis
- Remplir le .env à partir du .env.example en cohérence avec le projet back
- Installer Node

## Démarrage
- Installer les dépendances
- Exécuter le script `update-submodules`
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
