# Auth et profil
1. Étape « Protège ton compte » : le bouton de sortie s'appelle « Passer cette étape », avant comme après la génération du QR code (aujourd'hui « Annuler » puis « Plus tard »).
2. Codes de secours : ils s'affichent tout en haut du profil, loin de la section « Double authentification » où l'on vient d'agir. On ne les voit pas sans scroller. Les afficher là où l'action a eu lieu, ou dans une modale.
3. Le profil est trop grand : sur petit écran on s'y perd. Le rendre plus compact.
4. Méthode de connexion : chaque option exclusive affiche un petit avertissement sous son libellé. « Par email » : « Tu ne pourras plus te connecter avec ton mot de passe : il sera refusé comme identifiants incorrects ». Même logique pour « Par mon pseudo » et la connexion par email. Pas de confirmation, pas d'indice sur la page de connexion.
5. Préférence du profil : désactiver les transitions entre les pages (les autres animations restent). Le réglage système « réduire les animations » les coupe déjà (`usePrefersReducedMotion`) : la préférence force le même comportement. Proposé : gardée dans le navigateur (`localStorage`, comme la disposition des colonnes du backlog). Les visiteurs non connectés gardent le réglage système.

# Backlog — bugs
6. Après l'ajout d'un jeu, vider le champ de recherche IGDB. Aujourd'hui il garde sa valeur et relance une recherche non voulue.
7. Formulaires (ex. « Mes données » d'une version) : le `<label>` englobe le champ et déborde nettement sous lui (264×84 px), donc un clic sous le champ le focus. La zone cliquable doit se limiter au libellé et au champ. Le débordement à droite gêne moins, mais à corriger aussi.
8. Champs de durée : plus larges pour les grands nombres d'heures, avec plus de padding pour sélectionner la valeur et utiliser la molette plus facilement.
9. La croix d'effacement des champs texte est trop petite (ex. filtre de la colonne « Nom »).

# Performance
10. Ajout d'un jeu au backlog : délai visible entre la fin des requêtes et l'apparition du jeu dans le tableau (piste : cache TanStack Query).
11. Chaque mise à jour du tableau recharge le tableau entier (toutes les pages déjà chargées), ce qui coûte cher sur un grand backlog.
12. Mémoire : l'onglet prend ~102 Mo avec la première page du scroll infini, ~750 Mo avec toutes les pages (mesuré après rechargement), et les requêtes deviennent bien plus lentes. Pas reproductible à 100 %. Mesure faite avec 132 jeux en base, 130 au backlog, 176 versions. Piste : aucune virtualisation, toutes les lignes sont dans le DOM.
13. La base est sur un SSD rapide : lui allouer un gros cache (buffer pool MariaDB) pour accélérer les requêtes.
14. Console d'administration : temps de réponse par endpoint (tableau en millisecondes), ou tout moyen plus simple de repérer les points lents.

# Backlog — features

## Plateformes
15. Sous-plateformes : une plateforme enfant (émulateur ou launcher) est rattachée à une plateforme parente. Remplacer `emulated_platform_id` par une colonne parent et ajouter un type `emulator` / `launcher`. Reprendre les launchers PC de V023, insérés pour l'instant comme émulateurs du PC.
16. Second sélecteur : après le choix d'une plateforme qui a des enfants, un second sélecteur propose ses enfants. PS3 → RPCS3, PC → Steam, Epic… Si un enfant est choisi, c'est lui qui est enregistré, sinon c'est le parent.
17. Une icône par plateforme et par launcher, stockée dans `apps/client` et retrouvée par son `technical_name`. Pour l'instant, aucune icône n'est fournie : seule l'icône par défaut sert. Les SVG viendront plus tard. Un helper pour ça (s'il n'existe pas déjà).
18. Filtre sur une plateforme : correspondance exacte (filtrer « PC » ne montre pas Steam, filtrer « PS3 » ne montre pas RPCS3). Seules les versions jouées sur cette plateforme sont affichées. Un jeu joué sur PS3 et sur Steam, filtré sur Steam, devient une ligne simple non dépliable. Il reste dépliable s'il a plusieurs versions sur ce support (ex. Dead Space et Dead Space Remake sur Steam).

## Tableau
19. Récap en haut, à côté des nombres de jeux et de versions :
    - nombre de jeux finis : un jeu est fini dès qu'une de ses versions a un statut de fin (cf. 30) ;
    - temps de jeu, que l'on fait défiler au clic : total (relevé + estimé) → relevé → estimé.
20. Survol et focus d'une ligne :
    - Focus : bordures haut et bas en pointillés, fixes, de la couleur du thème de la ligne (neutre : gris clair en sombre / gris foncé en clair ; « En cours » : jaune…).
    - Survol : un reflet (effet miroir) balaie l'arrière-plan en boucle.
    - Le reflet est un dégradé à 110° (transparent 35 %, teinte 50 %, transparent 65 %), large de 60 %, qui glisse de `250%` à `-150%` en 2,25 s linéaire, à l'infini.
    - Teinte très légère : noir à 6 % en thème clair, blanc à 3,5 % en sombre. Elle suit le thème de la ligne (« En cours » : jaune…).
    - Réglage système « réduire les animations » : pas de balayage.
21. Le menu d'actions en bout de ligne est utilisable hors mode édition, et s'ouvre aussi par clic droit sur la ligne (qui la focus, cf. 20).
22. Couleurs des statuts, à valider sur proposition :
    - « Pas commencé » en gris ;
    - les statuts en cours (démarré, bien avancé…) dans les bleus-verts ;
    - les statuts de fin dans les rouges-jaunes.
23. Sans tri choisi, trier par date de mise à jour décroissante : en haut, le jeu dont une donnée personnelle (jeu au backlog ou version jouée) a été créée ou modifiée en dernier. Les données communes (fiche IGDB, série, plateformes) ne comptent pas.
24. Colonnes type de fin, plateforme et statut : filtres cumulables par cases à cocher (une case ou l'autre).
25. Mode de combinaison des filtres entre colonnes, au choix :
    - « ET » (actuel) : une ligne doit passer tous les filtres ;
    - « OU » : une ligne doit passer au moins un filtre (PS5 OU nom contenant « biz »).
26. Un bouton pour réinitialiser tous les filtres d'un coup.
27. Un bouton pour remonter en haut de la page : dans le header sticky ou en bas de page, sans jamais gêner la lecture du tableau.
28. Jeu dont plusieurs versions ont un commentaire : la ligne principale affiche un badge « X commentaires ».
29. En mode édition, le type de fin d'un jeu se modifie directement dans sa cellule.

## Statuts et types de fin
30. Statuts de fin, partout dans l'appli : Vu sans jouer, Fini, Estimé fini, Complété, Platiné, Complété et platiné. Relever et corriger toute incohérence avec cette définition.
31. Type de fin facultatif. Il est personnel (porté par `backlog_user_game`) : un joueur peut avoir BF6 en « Multijoueur », un autre en « Histoire ».
    - Sans type de fin, les statuts de fin sont absents du sélecteur de statut. Une option désactivée indique qu'il faut choisir un type de fin pour y accéder.
    - Si une version a un statut de fin, le type de fin ne peut plus être retiré, seulement changé.
    - Le changer n'affiche un avertissement que si une version a un statut de fin (qui sera converti).
32. « Runs » propose les mêmes statuts que « Multijoueur » et « Bac à sable » : « Estimé fini » au lieu de « Fini ». « Vu sans jouer » devient réservé à « Histoire ». Migration des données existantes : Runs « Fini » → « Estimé fini », Runs « Vu sans jouer » → « Pas commencé ». Ce n'est plus un statut de fin, mais ne pas avoir joué un jeu qui n'est pas « Histoire » ne peut pas valoir fin. C'est aussi ce que fait déjà un changement de type de fin.
33. Case « En cours » par version, à gauche de « À faire plus tard », indépendante du statut et cumulable avec elle. Couleurs de ligne : « En cours » reprend le jaune actuel, « À faire plus tard » passe en bleu. Les deux cochées : le jaune l'emporte.

## Saisie
34. Calendrier du champ date : mois et année sur deux lignes, chacun modifiable à la molette.

## Modales d'ajout
35. Ajout d'un jeu : rappeler la date de sortie et donner le lien IGDB.
36. Ajout d'un jeu : un lien IGDB sur chaque DLC listé.
37. Ajout d'une version : « Possédé » coché par défaut.
38. Ajout en chaîne : après l'ajout d'une version, un bouton propose d'en ajouter une autre, sans limite. Ensuite seulement viennent les DLCs choisis pour être ajoutés comme jeux. Annuler une version n'annule pas les DLCs en attente : ils apparaissent quand même à la suite.
39. Réduire la modale d'ajout (en base ou au backlog) : le flou disparaît, le tableau redevient scrollable en lecture seule, le bandeau de la modale reste en haut. Un clic sur le bandeau la rouvre en grand, avec le flou et le focus.
40. Recherche IGDB : reconnaître un id IGDB valide saisi dans la barre. À évaluer, peut-être une mauvaise idée.

## Base de jeux
41. Renommer le bouton « Ma base » en « Ajouter un jeu depuis la Citadel », en gardant son compteur. Il ouvre les jeux déjà en base et hors backlog, ajoutables sans passer par IGDB.
42. Depuis cette modale, supprimer un jeu de la base, seulement si personne ne l'a dans son backlog. Ça révèle une info sur les autres utilisateurs, acceptable dans ce contexte.

# Technique
43. `validate-all` lance aussi les tests end-to-end, toujours. C'est le script d'avant mise en prod, pas celui du dev courant.
44. `validate-all` enregistre son dernier succès (date, commit, empreinte des fichiers d'environnement) et se saute si :
    - le commit n'a pas changé ;
    - aucun fichier n'est modifié, hors `docs/` et hors fichiers `.md` ;
    - aucun fichier d'environnement (`.env*`) n'a changé.

# Navigation
45. Les boutons qui mènent à une page deviennent de vrais liens (nouvel onglet, clic molette) :
    - Backlog, barre du haut : « Profil » et « Retour à la Citadel » ;
    - Compteur de morts, en-tête : « Mon profil » et « Retour à la Citadel ».
    - Déjà des liens : « Retour à la Citadel » d'Angers Irigo.
    - Non concernées : les redirections après une action (fin de suppression des données, vérification d'email, sortie de « Protège ton compte »).

---

# Pour plus tard
- **Types de fin et statuts personnalisables.** Chaque utilisateur gère sa propre liste de types de fin (nom, description) et sa propre liste de statuts (nom, description). Un statut vaut pour tous les types de fin ou pour certains seulement. Il porte une propriété « représente un jeu fini, d'une manière ou d'une autre », qui remplace la liste fixe du point 30. Prolonge les points 30 à 32.
