# Homepage

[Citadel](../../README.md) › Homepage

La vitrine des projets, sur la route `/homepage` (où mène `/`), publique. Elle doit plaire à son auteur aussi : on pourrait aller directement sur chaque projet, on passe par là par plaisir. Visiteurs : moi surtout, des amis à qui je montre un projet, et n'importe qui puisque le site est public, sur ordinateur comme sur téléphone. C'est aussi le modèle à suivre pour des effets visuels. Ce qui reste à faire est dans le [todo](../todo/todo.md#5-homepage).

## Sommaire

1. [Fonctionnement](#1-fonctionnement)
2. [Ambiances](#2-ambiances)
3. [Transitions entre projets](#3-transitions-entre-projets)
4. [Code](#4-code)
5. [Lancer](#5-lancer)

## 1. Fonctionnement

La page tient dans l'écran, sans défilement global :

```
┌───────────────────────────────────────────────────────────┐
│ [logo] La Citadel d'Alex       [clair/sombre] [Connexion] │  header transparent
├──────────────────┬────────────────────────────────────────┤
│                  │                                        │  conteneur principal :
│  roue des        │  zone de présentation                  │  il défile lui-même
│  projets         │  (accueil, ou projet sélectionné)      │  s'il déborde
│                  │                                        │
├──────────────────┴────────────────────────────────────────┤
│ © · GitHub · À propos · Contact · Mentions légales · …    │  footer toujours en bas
└───────────────────────────────────────────────────────────┘
      fond animé (lampe à lave) derrière toute la page
```

- **Roue des projets** : une boîte par projet, sur un arc de cercle vertical ; celle du centre est la plus grande. Elle tourne à la molette, au doigt et aux flèches, avec des butées : elle ne boucle jamais, même avec beaucoup de projets. Cliquer une boîte sélectionne le projet ; tourner ne sélectionne rien. Un anneau donne l'avancement de chaque projet. Ordre fixe : celui de `projectsDictionary`. Sur téléphone, la roue passe en haut, à l'horizontale.
- **Présentation** : sans sélection, un texte présente le site. Un projet sélectionné remplace le texte en place (sortie « fantôme », bloc par bloc), puis entre en cascade : rubrique, nom, texte, repères, « Y accéder », et un badge « Connexion requise » pour Game Death Counter et le Backlog. La croix « Revenir à l'accueil » désélectionne.
- **Adresses** : la sélection est dans l'adresse (`/homepage/backlog`) : le retour du navigateur ramène à la présentation précédente, et un lien vers un projet se partage. Les pages du footer aussi (`/homepage/mentions-legales`), affichées dans le conteneur principal ; Échap (hors saisie) les ferme et revient à la présentation d'où l'on venait. Une adresse inconnue sous `/homepage` mène à l'accueil.
- **Header** : logo hexagonal et « La Citadel d'Alex », qui donne aussi le titre de l'onglet ; choix clair / sombre ; compte ([authentification, §4.10](../auth/auth.md#410-dans-linterface)).
- **Intro** : le logo et son animation, jouée une fois par onglet ; une touche ou un clic la passe.
- **Footer** : copyright, lien GitHub vers le dépôt, et les pages « À propos », « Contact » (le [formulaire de contact](../mails/mails.md#4-formulaire-de-contact)), « Mentions légales », « Données personnelles » ([authentification, §8.4](../auth/auth.md#84-la-page-données-personnelles)). Ses liens sont en verre dépoli : presque invisibles sur le fond uni, ils restent lisibles quand un blob passe derrière.

## 2. Ambiances

- **Par défaut** : une lampe à lave, des blobs colorés à bord net qui se déforment et se mêlent lentement, en WebGL ; des halos flous en CSS si WebGL manque.
- **Projet sélectionné** : toute la page change d'ambiance en quelques secondes. Les blobs prennent les couleurs du projet, les jetons de style suivent son thème (couleurs, police, graisse, arrondis), que son bloc `ambiance` peut forcer, et un fond animé propre au projet s'ajoute derrière les blobs :
  - Game Death Counter : noir et braise, police à empattements, aucun arrondi, des braises qui montent (elles seules passent devant les blobs) ;
  - Backlog : violet et turquoise de son icône, police ronde, grands arrondis ;
  - Angers Irigo : anthracite et couleurs des lignes, police de signalétique, des bandes colorées qui glissent ;
  - Satisfactory : cyan et orange industriels, police technique, angles coupés, une grille hexagonale.
- Chaque ambiance existe en clair et en sombre. Intensité modérée ; `prefers-reduced-motion` coupe tout mouvement (lampe à lave figée, pas de fond de projet, simples fondus).
- Le thème de chaque projet vit dans le design system ([architecture, §5.2](../architecture/architecture.md#52-thème)) : la homepage en tire ses ambiances (`resolveAmbianceTheme`), ajouter un projet ne la touche pas.

## 3. Transitions entre projets

- « Y accéder » lance une transition dans le style du projet (par défaut, l'hexagone du logo). Le projet commence à se charger dès le clic ; l'écran se couvre, la page du projet s'affiche dessous, puis l'écran se découvre sur la page déjà prête. Si le chargement traîne encore 0,3 s après que l'écran est couvert, une astuce sur le projet s'affiche, et reste au moins 1,4 s pour être lue.
- Chaque projet a un bouton « Retour à la Citadel » qui rouvre sa présentation, avec la transition de la Citadel, sans rejouer l'intro. Précédent et suivant du navigateur, d'un projet à l'autre, ont aussi leur transition.
- Les transitions sont hors de la homepage (`react/appNavigation/projectTransition`) : montées hors du routeur, elles survivent au changement de page. Tout changement de projet en lance une, sans rien à faire de plus qu'un lien ou un `navigate` : l'`AppContainer` retient la navigation (`useBlocker`) le temps que l'écran se couvre, et la page qui arrive prévient qu'elle est affichée.

## 4. Code

```
apps/client/src/projects/homepage/
├── index.tsx        /homepage, /homepage/<projet sélectionné>, /homepage/<page du footer>
├── components/      Layout (ambiance, vues, intro, titre de l'onglet), Header, Footer, Background, Intro, Logo, ContactForm
├── pages/           Showcase (roue des projets et présentation), FooterPage
├── ambiance/        variables --ambiance-*, tirées du thème du projet sélectionné et animées d'un projet à l'autre
├── effects/         un effet par fichier, sans React : lampe à lave (WebGL), fonds animés (canvas), animations GSAP
├── api/             le formulaire de contact
├── routing/, content/, hooks/, helper/
└── variables.scss   jetons et mixins de l'ambiance
```

- Tout ce qui décrit un projet (nom, ordre, ambiance, présentation, connexion requise, avancement) vient de sa fiche dans `projectsDictionary` (`react/appNavigation`).
- Un effet est une fonction `create…` qui reçoit un canvas ou un élément, et rend de quoi le piloter et le détruire. Le composant le crée dans un `useEffect` et lui transmet ses props.
- Les textes des pages du footer sont dans `content/`.

## 5. Lancer

Inclus dans Citadel : voir [Lancer en local](../../README.md#2-lancer-en-local), puis http://localhost:3001. Les scénarios end-to-end sont L1 à L9 des [scénarios](../e2e/scenarios.md).
