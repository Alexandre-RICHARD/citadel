# Homepage : refonte

[Citadel](../README.md) › Homepage

Fichier temporaire : ce qui est décidé pour la refonte, les questions encore ouvertes et la feuille de route. Supprimé une fois la refonte livrée.

## 1. Principe

Une vitrine de mes projets, qui doit me plaire à moi aussi : je pourrais aller directement sur chaque projet, je passe par là par plaisir. Visiteurs : moi surtout, des amis à qui je montre un projet, et n'importe qui puisque le site est public. Ordinateur et téléphone à égalité, quelques visites par semaine.

La page tient dans l'écran, sans défilement global :

```
┌───────────────────────────────────────────────────────────┐
│ [logo] La Citadel d'Alex       [clair/sombre] [Connexion] │  header transparent
├──────────────────┬────────────────────────────────────────┤
│                  │                                        │  conteneur principal :
│  roue des        │  zone de présentation                  │  il défile lui-même
│  projets (~30 %) │  (accueil, ou projet sélectionné)      │  s'il déborde
│                  │                                        │
├──────────────────┴────────────────────────────────────────┤
│ © · GitHub · À propos · Mentions légales · Données        │  footer toujours en bas
└───────────────────────────────────────────────────────────┘
      fond animé (lampe à lave) derrière toute la page
```

## 2. La roue des projets

- Une petite boîte par projet, avec seulement son nom, en capitales. Celle qui est sélectionnée est sur une barre pleine, comme le menu de BF3 (seulement les boutons : pas le reste de BF3).
- Les boîtes sont posées sur un arc de cercle vertical, bombé vers la droite : celle du centre est la plus grande, les autres s'éloignent en suivant la courbe et en s'estompant (référence : la roue des mois du template « Recap » de Rico ; wireframe : [image.png](image.png)). On fait tourner la roue à la molette, au doigt et aux flèches, avec des butées en haut et en bas : la roue ne boucle jamais, même avec beaucoup de projets.
- Cliquer sur une boîte sélectionne le projet et l'amène au centre. Faire tourner la roue ne sélectionne rien.
- Un petit bouton ✕, dans le creux de l'arc à gauche de la boîte centrale, désélectionne et ramène à l'état initial.
- Ordre fixe : celui de `projectsDictionary`. La Homepage n'y figure plus.
- Sur téléphone : la roue passe en haut, en arc horizontal, et la présentation en dessous.
- Un petit pourcentage d'avancement sur chaque boîte, en anneau (références : jauges en donut, une claire et une sombre).

## 3. La zone de présentation

- **Rien de sélectionné** : un texte présente le site et invite à choisir un projet.
- **Sélection d'un projet** : le texte en place sort façon fantôme, bloc par bloc : chacun ondule lentement, descend en se balançant comme une feuille qui tombe et s'efface jusqu'à l'opacité 0. Puis la présentation du projet entre, en cascade : titre, puis texte, puis bouton (référence : CodePen « Slider transitions » de fluxus).
- **Présentation** : l'illustration actuelle du projet, ce qu'il fait, à quoi il sert, à qui il s'adresse, comment il marche (lorem ipsum pour commencer), un bouton qui mène au projet. Un badge « Connexion requise » à côté du bouton prévient quand le projet demandera de se connecter : Backlog et Game Death Counter. Le badge est factice tant que les comptes n'existent pas.
- Changer de projet rejoue la même séquence. Un clic pendant une transition l'interrompt et lance la suivante.
- La sélection est dans l'adresse (`/homepage/backlog`) : le bouton retour du navigateur ramène à la présentation précédente, et on peut partager un lien vers un projet. Les pages du footer aussi (`/homepage/mentions-legales`), affichées dans le conteneur principal ; `Échap` les ferme et revient à la présentation d'où l'on venait.
- **Vers le projet** : le bouton lance une transition dans le style du projet (rideau sombre bordé de braises, tuiles, tram aux couleurs des lignes, hexagones ; par défaut, l'hexagone du logo). Le projet commence à se charger dès le clic ; l'écran se couvre, la page du projet s'affiche dessous, puis l'écran se découvre sur la page déjà prête, en 1,5 s environ. Si le chargement traîne encore 0,3 s après que l'écran est couvert, une astuce sur le projet s'affiche, et reste au moins 1,4 s pour être lue.
- **Retour** : chaque projet a un bouton (un château) qui ramène à sa présentation sur la homepage, avec la transition de la Citadel. Précédent et suivant du navigateur, d'un projet à l'autre, ont aussi leur transition.

## 4. Ambiances

- **Clair et sombre**, au choix dans le header ; par défaut, la préférence du système. Chaque application qui propose ce choix l'enregistre dans le localStorage, seulement quand il diffère de la préférence du système : revenir au thème du système efface l'entrée.
- **Par défaut** : une lampe à lave, des blobs colorés à bord net qui se déforment et se mêlent lentement (couleurs saturées, dans l'esprit de l'image Domestika). En WebGL ; des halos flous en CSS si WebGL manque.
- **Projet sélectionné** : toute la page change d'ambiance en quelques secondes. Les blobs prennent les couleurs du projet, les jetons de style changent (couleurs, police, graisse, arrondis : ceux du thème du projet, que son ambiance peut forcer, avec une police de texte ou une couleur plus vive), et un fond animé propre au projet s'ajoute, derrière les blobs ; seules les braises de Game Death Counter passent devant :
  - Game Death Counter : noir et braise, police à empattements gravée, aucun arrondi, des braises qui montent ;
  - Backlog : violet et turquoise de son icône, boutons verts, police ronde, grands arrondis ;
  - Angers Irigo : anthracite et couleurs des lignes, boutons jaunes en sombre, police de signalétique, des bandes colorées qui glissent ;
  - Satisfactory : cyan et orange industriels, police technique, angles coupés, une grille hexagonale.
- Chaque ambiance existe en clair et en sombre.
- Intensité des effets : 2,5 sur 5. `prefers-reduced-motion` coupe tout mouvement (lampe à lave figée, pas de fond animé de projet, simples fondus) : pour le confort et pour les téléphones.
- Cette refonte sert de pilote au nouveau thème global (« Refaire entièrement le thème », dans le TODO). Les jetons (clair, sombre, nouveaux jetons comme la graisse ou les polices par rôle) vont dans le design system, avec le thème de chaque projet : chaque projet a désormais son mode clair et son mode sombre, avec un bouton pour choisir.

## 5. Header, intro et footer

- **Header** transparent. À gauche, le logo hexagonal et « La Citadel d'Alex », qui devient aussi le titre de l'onglet. À droite, le choix clair/sombre puis le bouton de connexion, inactif pour l'instant. Une fois les comptes faits : le pseudo et un bouton de déconnexion.
- **Intro** : le logo et son animation sont gardés pour l'instant. Une touche qui n'est pas déjà un raccourci, ou un clic, la passe. Son cache blanc suit le thème sombre.
- **Footer** : le copyright, une icône GitHub vers le dépôt (public), et trois liens : « À propos » (le site, la stack, le NAS), « Mentions légales » (propriétaire, hébergement), « Données personnelles » (ce qui est stocké et pourquoi). Je rédige des textes par défaut, que tu relis. Les liens et le copyright sont en verre dépoli : presque invisibles sur le fond uni, ils floutent ce qui passe derrière pour rester lisibles quand un blob traverse le footer, et s'affirment au survol.
- Données personnelles, à couvrir : session et localStorage (intro vue, thème, réglages d'Irigo et du Backlog), le futur cookie de connexion, les journaux du serveur (IP, pays), Cloudflare, et les ressources tierces (tuiles OpenStreetMap, images IGDB). Les polices seront hébergées sur le site, plutôt que chargées depuis Google Fonts comme aujourd'hui : c'est une ressource tierce de moins à déclarer.

## 6. Contraintes

- Tout ce qui décrit un projet vient de sa fiche dans `projectsDictionary` : nom, ordre, ambiance, présentation, connexion requise, avancement. Ajouter un projet ne touche pas à la homepage.
- Aucun endpoint.
- Dépendances possibles (une bibliothèque d'animation, par exemple), avec ton veto rapide. Pas de 3D.

## 7. Feuille de route

1. [toi] Valider ce récap et répondre aux questions ouvertes. Fait.
2. [moi] Une maquette HTML jetable et cliquable dans `docs/homepage-maquette/`, avec des variantes à basculer (rendu des blobs, ambiances, clair/sombre, téléphone), plutôt que trois pages séparées. Fait.
3. [nous] Choisir sur la maquette et ajuster. Fait.
4. [moi] Jetons du thème : clair, sombre et ambiances des projets. Fait ; les polices viennent encore de Google Fonts.
5. [moi] Structure : header, conteneur principal qui défile, footer, routes. Fait.
6. [moi] Roue des projets. Fait.
7. [moi] Fond lampe à lave et transitions d'ambiance. Fait.
8. [moi] Zone de présentation : accueil, sortie fantôme, présentation, badge. Fait.
9. [moi] Intro qu'on peut passer, adaptée au thème sombre. Fait.
10. [moi] Pages du footer, avec des textes par défaut. Fait.
11. [moi] Téléphone et `prefers-reduced-motion`. Fait.
12. [toi] Relire les textes légaux, remplacer le lorem ipsum.
13. [moi] Transitions vers les projets, avec l'astuce quand le chargement traîne. Fait.
14. [nous] Héberger les polices sur le site, à la place de Google Fonts : tu les télécharges, je les branche.
15. [moi] Dans chaque projet, un bouton de retour à la homepage adapté à son interface, qui lance la transition de retour ; il remplace le bouton 🏠. Fait.
16. [moi] Reporter le « Pour plus tard » dans le TODO, supprimer ce fichier, le wireframe et la maquette.

## 8. Pour plus tard

- Console de commande : `²` ouvre une console à la Quake pour aller quelque part en tapant (`goto backlog`).
- Mini-jeu, par exemple sur le logo hexagonal.
- Refaire le logo et son intro.
