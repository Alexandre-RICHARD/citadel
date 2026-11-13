# Design system

[Citadel](../../README.md) › Design system

Les composants d'interface, le thème et les polices partagés par le site et la console d'administration, dans `packages/design-system`, avec leur Storybook. Les règles de rangement et de nommage sont dans l'[architecture](../architecture/architecture.md#51-composants) ; ce qui reste à faire (réunification, nouveau thème, portail commun) est dans le [todo](../todo/todo.md#12-interface-et-design-system).

## Sommaire

1. [Contenu](#1-contenu)
2. [Thème](#2-thème)
3. [Polices et styles](#3-polices-et-styles)
4. [Utiliser un composant](#4-utiliser-un-composant)
5. [Storybook](#5-storybook)

## 1. Contenu

Tout est dans `src/`, un dossier par composant (avec son `.module.scss` et sa story).

| Dossier | Contenu |
| --- | --- |
| `atoms/` | `BurgerButton`, `Button`, `CacheOverlay`, `CheckboxInput`, `CountBadge`, `ExpandToggle`, `Icon`, `IconButton`, `IconLink`, `LabelWithIcon`, `Pill`, `RangeInput`, `RequiredMark`, `Skeleton`, `TextInput` |
| `molecules/` | `ButtonSelect`, `ConfirmDialog`, `Dropdown`, `ErrorState`, `Modal` |
| `organisms/` | `Selector`, `SideNavigation` (le menu latéral du profil et de Satisfactory), `Toaster` |
| `theme/` | Thèmes, fournisseur de thème, choix clair ou sombre (§2) |
| `fonts/`, `styles/` | Polices hébergées, réinitialisation et styles globaux (§3) |
| `mailPreview/` | L'aperçu des gabarits de mails dans Storybook ([mails, §6](../emails/emails.md#6-côté-serveur)) |

Deux composants portent des règles à retenir :

- `Skeleton` transforme n'importe quel rendu en silhouette de chargement : aucun composant n'a de variante squelette ([architecture, §5.4](../architecture/architecture.md#54-lecture)).
- `RequiredMark` est l'astérisque rouge des champs obligatoires, jamais un `*` écrit à la main ([architecture, §5.1](../architecture/architecture.md#51-composants)).

## 2. Thème

- Un thème (`ThemeType`) est une liste de jetons : chaque clé devient une variable CSS préfixée par `--theme-` (`colorText` devient `var(--theme-colorText)`). Les jetons couvrent les fonds et surfaces, les bordures, les textes, les intentions (primaire, secondaire, accent, destructive : une teinte, sa version renforcée, son fond discret et le texte posé dessus), les polices, les arrondis et les coins coupés.
- `ThemeProvider` pose les variables sur un élément. À la racine, il reçoit le thème complet ; imbriqué, seulement les valeurs à surcharger, le reste est hérité.
- Chaque projet a son thème dans `theme/projectThemes/` : `citadelTheme` (la homepage et l'authentification), `gameDeathCounterTheme`, `backlogTheme`, `angersIrigoTheme`, `satisfactoryTheme`. Chacun existe en clair et en sombre, avec des valeurs partagées (polices, arrondis) et des couleurs par mode.
- `useDocumentTheme` pose le thème du projet affiché sur `<html>` (portails, fond jusque dans les débordements). `resolveAmbianceTheme` en tire les ambiances de la homepage ([homepage, §2](../homepage/homepage.md#2-ambiances)).
- Clair ou sombre : la préférence du système, sauf choix fait dans le projet, retenu dans le `localStorage` ([architecture, §5.2](../architecture/architecture.md#52-thème)).

Créer ou changer un thème : voir [architecture, §9.2](../architecture/architecture.md#92-brancher-un-nouveau-projet) pour brancher un nouveau projet ; la fiche `theme/theme.stories.tsx` montre chaque thème dans Storybook.

## 3. Polices et styles

- Les polices sont hébergées dans `fonts/` (un woff2 latin par style), toutes déclarées dans `fonts.scss` : Chakra Petch, Cinzel, EB Garamond, Inter, JetBrains Mono, Nunito, Outfit, Overpass, Roboto, Unbounded. Le navigateur ne télécharge que celles qui s'affichent. Une nouvelle police s'ajoute ici, avec sa licence.
- `styles/reset.scss` remet à zéro les styles du navigateur et coupe les animations et transitions si `prefers-reduced-motion` est actif.
- `styles/global.scss` fixe `1 rem = 10 px` (`html { font-size: 62.5% }`), la police par défaut et le fond de la page, pris dans le thème.

## 4. Utiliser un composant

Le paquet n'a pas de point d'entrée unique : chaque composant s'importe par son chemin, depuis le front du site ou de la console (`@citadel/design-system/src/atoms/Button`). Un composant ne connaît ni les DTO, ni l'API, ni les routes : il reçoit des props et ne dépend que de `common`. Seul `mailPreview/` importe du serveur, pour afficher ses gabarits.

## 5. Storybook

`pnpm --filter @citadel/design-system dev` ouvre Storybook sur http://localhost:3002. Chaque composant a au moins une story (`*.stories.tsx`), et `pnpm --filter @citadel/design-system build` construit un Storybook statique dans `build/`. Les gabarits de mails y ont leur section « Mails ».
