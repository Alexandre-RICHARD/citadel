# Le Tunnel — Cahier des charges v3

Nov 4, 2026 · @Alex Perso

## 1. Concept et objectifs

« Le Tunnel » est un quiz par équipes, inspiré de l'émission Popcorn, à jouer lors de la soirée du nouvel an 2026. Il s'intègre comme projet « mixte » à l'application existante : l'administration demande un compte, le visionnage d'une partie non.

**Le principe en une phrase** : une équipe enchaîne des questions de plus en plus difficiles dans un thème. Elle accumule des points qu'elle ne sécurise qu'en s'arrêtant. Si elle se trompe, elle perd la série et une autre équipe peut la récupérer.

**Ce qui fait le sel du jeu** : savoir quand s'arrêter. Le jeu est volontairement injuste et stratégique.

**Objectifs du POC**

- Prêt pour le 31 décembre 2026 (environ 8 semaines).
- Parties courtes, rythmées et fun : aucune action ne doit faire attendre la salle.
- Un socle simple sur lequel on greffe des fonctionnalités prudemment, une à une.
- Le présentateur garde la main sur tout : l'application assiste, elle ne décide rien à sa place.

**Hors périmètre du POC** : questions image, audio ou vidéo, mini-jeux intégrés à l'application, multi-présentateur, langues autres que le français.

**Durée de vie** : le jeu sera peut-être joué une seule fois, mais il est conçu pour plusieurs parties (exclusion des questions déjà utilisées, parties de test).

## 2. Lexique

Ces mots ont un sens précis dans tout le document et dans le code. Les trois états d'une question (à jouer, en suspens, validée) sont le cœur du jeu.

### Le contenu

| Terme | Définition simple |
| --- | --- |
| **Thème** | Un sujet de questions, avec un nom, un emoji et une couleur. Privé à sa création. S'il devient public, d'autres utilisateurs peuvent y ranger leurs propres questions. |
| **Question** | Un énoncé, une réponse, une explication facultative et un niveau. Elle appartient à son auteur et reste toujours privée, même dans un thème public. |
| **Niveau** | Facile, intermédiaire, difficile ou extrême. Il fixe les points et le temps de réponse. |
| **Banque de questions** | Les questions d'un utilisateur, rangées par thème. Chacun n'accède qu'à la sienne. |
| **Question utilisée** | Une question déjà affichée à l'écran lors d'une partie qui n'était pas une partie de test. |

### La partie

| Terme | Définition simple |
| --- | --- |
| **Partie** | Une session de jeu. Ses questions sont tirées dans la banque du présentateur puis copiées et figées. |
| **Partie de test** | Une partie qui ne marque aucune question comme utilisée. Elle sert à répéter avant la soirée. |
| **Équipe** | Un groupe de joueurs avec un nom et une couleur, unique dans la partie. |
| **Membre** | Un joueur d'une équipe, identifié par un prénom. Le prénom est réduit à son initiale à la fin de la partie. |
| **Équipe en pause** | Une équipe qui ne joue plus de tour pour l'instant. Ses points restent et elle peut revenir. |
| **Plateau** | La vue d'ensemble des thèmes de la partie, de leur avancement et du classement. |
| **Tour** | Le moment où une équipe a la main. Il commence au choix d'un thème et se termine par un arrêt, une erreur, la fin du thème ou un passage. |
| **Série** | Les bonnes réponses qu'une équipe enchaîne pendant son tour. |
| **Question annulée** | Une question retirée en cours de jeu (énoncé faux, réponse contestée par tous), sans pénalité. |
| **Question de réserve** | Une question non tirée du même thème et du même niveau, qui peut remplacer une question annulée. |
| **Hors compétition** | Le jeu qui continue après la fin officielle, pour le plaisir. Plus aucun point ne compte. |

### Les trois états d'une question

| État | Ce que ça veut dire | Exemple |
| --- | --- | --- |
| **À jouer** | Personne n'a encore réussi cette question. Une question ratée reste « à jouer ». | La question 6 que l'équipe A vient de rater. |
| **En suspens** | Une équipe y a répondu juste, mais ses points ne sont pas encore encaissés. | Les questions 3, 4 et 5 réussies par l'équipe A avant son erreur. |
| **Validée** | Ses points appartiennent définitivement à une équipe. Sa réponse est consultable par tous. | Les questions 1 et 2, encaissées plus tôt. |

### Les points

| Terme | Définition simple |
| --- | --- |
| **Question en cours** | La première question « à jouer » d'un thème. C'est toujours elle qu'on pose quand on choisit ce thème. |
| **Demi-points** | Une réponse acceptée à moitié : elle rapporte la moitié des points de la question et permet de continuer. |
| **Bonus** | Une réponse remarquable : elle rapporte les points de la question plus 1. |
| **Points obtenus** | Les points réellement attribués à une question (normaux, demi ou bonus). |
| **Cagnotte** | La somme des points obtenus des questions en suspens d'un thème. Elle appartient au thème, pas à une équipe : elle survit aux erreurs. |
| **Points en jeu** | La cagnotte plus les points de la question en cours. |
| **Encaisser** | S'arrêter et transformer la cagnotte en points définitifs. Les questions en suspens deviennent validées. |
| **Remise en jeu** | Après une erreur, la cagnotte reste dans le thème. L'équipe qui réussit ensuite la question en cours la récupère, avec les points tels qu'ils ont été obtenus. |
| **Thème terminé** | Toutes ses questions sont validées. Il est grisé et ne peut plus être choisi. |
| **Score** | Les points obtenus des questions validées par l'équipe, plus ses ajustements. |
| **Ajustement** | Des points ajoutés ou retirés à la main par le présentateur (fin de partie, jeu bonus). |
| **Score cible** | Le score dont l'atteinte met la partie en pause sur l'écran de victoire. |

### Les écrans

| Terme | Définition simple |
| --- | --- |
| **Présentateur** | L'utilisateur connecté qui a créé la partie. Lui seul agit. |
| **Écran joueurs** | Tout écran ouvert avec le code : la TV et les téléphones des invités, sans limite de nombre. |
| **Mode « suivre »** | L'écran affiche la scène choisie par le présentateur. C'est le mode de la TV. |
| **Accueil de la partie** | La page de navigation libre d'un spectateur : thèmes, avancement, classement. C'est aussi la scène affichée entre deux tours. |
| **Scène** | Ce que l'écran en mode « suivre » affiche à un instant donné. Le présentateur la pilote, indépendamment de la page où il se trouve. |
| **Code de partie** | Un code de 8 caractères qui ouvre l'écran joueurs d'une partie. |
| **Lien de récapitulatif** | Un lien permanent, protégé par un jeton, vers le résumé d'une partie terminée. |
| **Panneau « i »** | Le panneau d'informations du présentateur : questions restantes, thèmes terminés, temps, équipe en tête, tentatives de triche. |

## 3. Règles du jeu

Une équipe joue un thème jusqu'à ce qu'elle s'arrête, se trompe ou le termine. La cagnotte d'un thème ne disparaît jamais : elle attend l'équipe qui réussira la question en cours.

### Niveaux (fixes, en dur dans le code)

| Niveau | Nom | Points | Demi-points | Bonus | Temps |
| --- | --- | --- | --- | --- | --- |
| 1 | Facile | 1 | 0,5 | 2 | 20 s |
| 2 | Intermédiaire | 2 | 1 | 3 | 30 s |
| 3 | Difficile | 3 | 1,5 | 4 | 45 s |
| 4 | Extrême | 5 | 2,5 | 6 | 60 s |

Un thème peut contenir n'importe quelle combinaison de niveaux. Au tirage, une partie retient au plus 10 questions par thème (réglable), réparties équitablement entre les niveaux. Le nombre de questions par niveau reste un mystère pour les joueurs.

### Ordre de passage

- L'ordre est fixé avant la partie, par un mini-jeu dans la vraie vie. Le présentateur le saisit dans l'application.
- Les équipes jouent ensuite à tour de rôle, en boucle. Une équipe en pause est sautée.

### Déroulé d'un tour

1. **Choix du thème** : l'équipe active choisit un thème non terminé, y compris celui où elle vient d'échouer. L'écran joueurs montre le thème, la cagnotte et le niveau de la question en cours, jamais son énoncé.
2. **Affichage** : le présentateur affiche la question. L'énoncé apparaît à l'écran et le chrono démarre (si l'option est active).
3. **Fin du chrono** : un son retentit. Rien n'est automatique, le présentateur refuse les réponses tardives.
4. **Jugement** : le présentateur choisit Juste, Demi-points, Bonus ou Faux.
5. **Si la réponse est juste, à moitié juste ou remarquable** : la question passe en suspens avec ses points obtenus, et la réponse et son explication s'affichent. Puis :
   - si c'était la dernière question du thème, la cagnotte est encaissée automatiquement et le tour passe ;
   - sinon, l'écran montre le niveau de la question suivante, et l'équipe choisit de **s'arrêter** (elle encaisse, le tour passe) ou de **continuer**.
6. **Si la réponse est fausse** : la réponse reste cachée. La question reste à jouer, la cagnotte reste dans le thème, et le tour passe. Les joueurs doivent se souvenir de l'énoncé s'ils veulent retenter.
7. **Annuler la question** : à tout moment, y compris après la révélation de la réponse si tout le monde la conteste. Aucune pénalité. Elle est remplacée par une question de réserve du même niveau si possible.
8. **Passer** : le présentateur peut faire passer le tour d'une équipe (bouton discret, non annoncé aux joueurs).
9. **Mettre une équipe en pause** : elle ne joue plus de tour, garde ses points, et peut être réactivée.

&#91;embedded content: déroulé d'un tour · 3 décisions\]

Un tour se termine toujours par « Tour suivant » : sur une erreur, la cagnotte reste dans le thème ; sur un arrêt ou la fin du thème, elle est encaissée.

### Exemple complet

Thème A, 8 questions : Q1 et Q2 valent 1 point, Q3 et Q4 valent 2, Q5 et Q6 valent 3, Q7 et Q8 valent 5. Rouge a déjà validé Q1 et Q2.

| Étape | Ce qui se passe | Cagnotte du thème A | Scores |
| --- | --- | --- | --- |
| 1 | Bleu réussit Q3, obtient un demi-point sur Q4, réussit Q5, et continue | 6 (Q3 = 2, Q4 = 1, Q5 = 3) | Rouge 2, Bleu 0, Vert 0 |
| 2 | Bleu rate Q6. Q6 reste à jouer, la réponse reste cachée | 6 | inchangés |
| 3 | Vert choisit le thème A : on lui pose Q6. Il réussit | 9 (Q3 à Q6 en suspens) | inchangés |
| 4a | Vert s'arrête : Q3 à Q6 deviennent validées par Vert. Le demi-point de Bleu sur Q4 lui profite tel quel | 0 | Rouge 2, Bleu 0, Vert 9 |
| 4b | Ou bien Vert continue et rate Q7 : tout reste en suspens pour la prochaine équipe | 9 | inchangés |

### Questions en suspens et injustice assumée

L'équipe qui récupère une cagnotte hérite des points tels qu'ils ont été obtenus, demi-points compris. Elle peut donc profiter d'un demi-point d'une autre équipe. C'est voulu : le jeu récompense la stratégie, pas la justice.

## 4. Score cible et fin de partie

Le score cible par défaut se calcule avec un coefficient de 90 %, fixé dans le code. Le présentateur peut modifier la valeur proposée pour chaque partie. En pratique, la partie se terminera surtout à la main, et c'est voulu.

### Le calcul de la valeur par défaut

```latex
\text{cible} = \left\lceil \frac{\text{points possibles} \times 90\,\%}{\text{nombre d'équipes}} \right\rceil
```

- **Points possibles** : la somme des points des questions tirées (hors demi-points et bonus).
- **Coefficient** : une constante du code (par exemple `TARGET_SCORE_COEFFICIENT = 0.9`), pas un réglage de partie.
- **Exemple** : 300 points, 6 équipes, 300 × 0,9 / 6 = 45, donc une cible de **45 points**.
- **Pourquoi ça ne bloque jamais** : si tous les points sont distribués, au moins une équipe a la moyenne (50 ici), qui dépasse la cible.
- **La limite** : cette garantie ne joue qu'une fois presque tous les points encaissés. La cible ne sera donc atteinte que si une équipe domine nettement.

La valeur s'affiche avec son calcul, une fois le tirage fait. Elle se recalcule si la configuration change, tant que le présentateur ne l'a pas modifiée à la main.

### Les fins possibles

| Fin | Déclencheur | Ce qui se passe |
| --- | --- | --- |
| **Cible atteinte** | Une équipe encaisse et atteint la cible | La partie se met en pause sur l'écran de victoire et le classement. Le présentateur peut reprendre si les joueurs en veulent encore |
| **Fin manuelle** | Le présentateur clique sur « Terminer la partie » (manque de temps, lassitude, questions épuisées) | Classement final, l'équipe en tête gagne |
| **Égalité en tête** | Deux équipes ou plus à égalité lors d'une fin manuelle | Un jeu bonus hors application les départage, et le présentateur saisit les points en ajustement |

### Après la fin : hors compétition

- Une fois la partie terminée, le présentateur peut continuer à jouer les questions restantes pour le plaisir.
- Les règles sont les mêmes, mais aucun point ne compte : le classement officiel est figé.
- Les réponses des questions jouées dans ce mode restent visibles.
- Le code reste valide jusqu'à ce que le présentateur clôture la partie.

### Ajustements

- Sur l'écran de classement, et à tout moment de la partie, le présentateur peut ajouter ou retirer des points à une équipe, avec un motif court (« jeu bonus », « fair-play »).
- Un ajustement compte dans le score comme des points encaissés.

## 5. Banque de questions et menu principal

Toute la rédaction se fait en amont, depuis le menu principal du Tunnel. On y gère sa banque, on importe et exporte ses questions, et on prépare ses parties.

### Proposition de menu principal

| Rubrique | Contenu |
| --- | --- |
| **Mes parties** | Brouillons, en pause, en cours, terminées, parties de test. Reprendre, dupliquer, supprimer un brouillon, copier le lien de récapitulatif. |
| **Mes thèmes** | Mes thèmes (privés et publics) et les thèmes publics où j'ai au moins une question. Pour chacun : emoji, nom, visibilité, nombre de mes questions par niveau, nombre déjà utilisées. |
| **Thèmes publics** | Parcourir les thèmes publics des autres pour y ajouter mes propres questions. |
| **Importer / Exporter** | Importer un fichier JSON ou CSV. Exporter toute ma banque ou un seul thème. |
| **Nouvelle partie** | Lancer la configuration. |
| **Rejoindre une partie** | Le champ de saisie du code, comme n'importe quel spectateur. |

### Page d'un thème

- La liste de mes questions du thème, filtrable par niveau et par statut (utilisée ou non).
- Créer, modifier, supprimer une question. Une question déjà utilisée reste modifiable, puisque chaque partie garde sa copie.
- Le propriétaire du thème peut changer son nom, son emoji, sa couleur et sa visibilité.

### Format d'import et d'export

Le JSON est le format principal : une IA le produit et le relit sans erreur. Le CSV sert à travailler dans un tableur. L'explication est écrite en Markdown (voir les notes techniques).

```json
{
  "format": "le-tunnel",
  "version": 1,
  "themes": [
    {
      "name": "Cinéma",
      "icon": "🎬",
      "color": "#E4572E",
      "questions": [
        {
          "difficulty": 1,
          "statement": "Quel film de 1997 raconte le naufrage d'un paquebot ?",
          "answer": "Titanic",
          "explanation": "Réalisé par **James Cameron**."
        }
      ]
    }
  ]
}
```

- **CSV** : une ligne par question, colonnes `theme;icon;color;difficulty;statement;answer;explanation`, séparateur point-virgule et encodage UTF-8 avec BOM pour qu'Excel l'ouvre correctement.
- **Export** : ajoute à chaque question son `id` et un champ `used` (vrai ou faux). L'import ignore ces deux champs.
- **Rattachement** : un thème est rattaché par son nom à l'un de mes thèmes ou à un thème public. Sinon, il est créé, en privé.
- **Aperçu avant validation** : nombre de questions par thème et par niveau, erreurs ligne par ligne (niveau hors de 1 à 4, champ vide), doublons signalés.
- **Propriété** : les questions importées appartiennent à celui qui importe. L'import ne fait que créer, il ne modifie jamais une question existante.

## 6. Configuration d'une partie

Une partie se prépare en étapes et peut être sauvegardée sans être lancée. Le code d'invitation existe dès la création : les joueurs voient la préparation en direct, mais jamais les questions.

### Les étapes

1. **Création** : le présentateur nomme la partie. Le code, le lien et le QR code d'invitation sont générés.
2. **Options** : chrono, nombre maximum de questions par thème, exclusion des questions déjà utilisées, partie de test.
3. **Thèmes** : le présentateur choisit parmi ses thèmes et les thèmes publics où il a des questions. Seules ses propres questions sont tirées. Un thème qui a moins de questions disponibles que le maximum reste sélectionnable, avec un indicateur.
4. **Tirage** : un bouton tire les questions de chaque thème et les copie dans la partie. Il peut être relancé tant que la partie est en brouillon. Changer les options ou les thèmes oblige à refaire le tirage.
5. **Équipes** : nom, couleur, membres. Deux équipes minimum, pas de maximum.
6. **Ordre de passage** : saisi à la main après le mini-jeu de la vraie vie.
7. **Score cible** : valeur calculée, affichée avec son calcul, modifiable.
8. **Lancement** : la partie passe « en cours ».

La fiche PDF de secours est disponible dès le tirage, pour pouvoir l'imprimer avant la soirée.

### Le tirage équilibré

- Le maximum N est réparti le plus également possible entre les niveaux présents dans le thème. Le surplus va aux niveaux les plus bas (proposition) : pour N = 10 et 4 niveaux, 3 faciles, 3 intermédiaires, 2 difficiles et 2 extrêmes.
- Si un niveau manque de questions, ses places passent aux autres niveaux.
- Les questions sont ensuite classées par niveau croissant, dans un ordre aléatoire au sein d'un même niveau.
- Si l'option est cochée, les questions déjà utilisées sont écartées avant le tirage.
- Les questions non tirées forment la réserve, qui sert à remplacer une question annulée.

### Les couleurs d'équipe

Une palette d'environ 30 teintes contrastées. Une couleur prise par une équipe est indisponible pour les autres équipes de la même partie.

### Options de partie

| Option | Valeurs | Par défaut |
| --- | --- | --- |
| Chrono | activé ou désactivé | activé |
| Questions max par thème | 1 ou plus | 10 |
| Exclure les questions déjà utilisées | oui ou non | oui |
| Partie de test | oui ou non | non |
| Score cible | nombre entier | calculé (coefficient de 90 %) |

### Statuts d'une partie

| Statut | Sens |
| --- | --- |
| Brouillon | Préparée, tirage éventuellement fait, pas encore lancée |
| En cours | Les tours se jouent |
| En pause | Interrompue (à la main ou par une victoire), reprenable |
| Terminée | Classement officiel figé, hors compétition possible |
| Clôturée | Le code ne fonctionne plus, seul le lien de récapitulatif reste |

### Tout se voit en direct

Chaque action du présentateur se répercute presque immédiatement à l'écran joueurs, quand la scène le prévoit :

- un bouton ou une case à cocher : immédiatement ;
- un champ texte (nom d'équipe, de membre) : à la sortie du champ.

Le mécanisme est décrit dans les notes techniques.

## 7. Écrans et synchronisation

L'écran joueurs n'affiche pas « la page du présentateur » : il affiche une **scène**, que le présentateur fait évoluer par ses actions. Ce découplage règle d'un coup la synchronisation et la sécurité. Les écrans seront précisés lors du maquettage.

### Les deux écrans

| Écran | Utilisateur | Support | Droits |
| --- | --- | --- | --- |
| Présentateur | Le créateur de la partie, connecté | Tablette ou téléphone (responsive) | Toutes les actions |
| Joueurs | Toute personne qui a le code, sans compte | La TV, et les téléphones des invités, sans limite de nombre | Lecture seule |

### Deux façons de regarder

| Mode | Utilisé par | Ce qu'on voit |
| --- | --- | --- |
| **Suivre le présentateur** | La TV, et tout téléphone qui le souhaite | La scène en cours, imposée par le présentateur |
| **Accueil de la partie** | Les téléphones, en navigation libre | Les thèmes, leur avancement et le classement. Un bouton permet de passer en mode « suivre » |

Dans l'accueil, un clic sur un thème montre ses questions, sans leur énoncé tant qu'elles ne sont pas validées :

- **validée** : en vert, cliquable pour relire l'énoncé, la réponse et l'explication ;
- **en suspens** : en orange, non cliquable ;
- **à jouer** : en gris, non cliquable.

### Pourquoi des scènes

- Le présentateur navigue librement sans que la TV le suive.
- Certaines actions changent la scène automatiquement (afficher une question, juger une réponse). Les autres non.
- Le serveur construit les données de l'écran joueurs à partir de la scène et de l'état public de la partie. Il n'envoie donc que ce que la scène doit montrer.

### Les scènes

| Scène | L'écran joueurs affiche | Déclenchée par |
| --- | --- | --- |
| Attente | Nom de la partie, code, QR code | Création de la partie |
| Préparation | Options, thèmes choisis et leur nombre de questions, équipes, couleurs, membres, ordre, score cible | Modifications de configuration |
| Accueil de la partie | Thèmes et avancement, cagnottes, classement, équipe active | Lancement, fin d'un tour, bouton « Plateau » |
| Thème choisi | Équipe active, thème, cagnotte, niveau de la question en cours | Choix d'un thème |
| Question | Énoncé, niveau, points en jeu, chrono, barre de progression | Bouton « Afficher la question » |
| Bonne réponse | Réponse, explication, nouvelle cagnotte, niveau de la question suivante | Jugement « Juste », « Demi » ou « Bonus » |
| Mauvaise réponse | « Faux », cagnotte remise en jeu, sans la réponse | Jugement « Faux » |
| Question annulée | Message d'annulation, puis la question de remplacement s'il y en a une | Bouton « Annuler la question » |
| Encaissement | Points encaissés, nouveau score | Arrêt ou fin du thème |
| Classement | Scores et ajustements | Bouton « Classement », fin manuelle |
| Victoire | Équipe gagnante, classement | Cible atteinte ou fin manuelle |
| Pause | Écran d'attente | Mise en pause |
| Hors compétition | Un bandeau permanent « hors compétition » sur les scènes de jeu | Choix du présentateur après la fin |

### Éléments permanents de la TV

- Le code et le QR code de la partie, dans un coin, pour rejoindre en spectateur à tout moment.
- Le nom de l'équipe active, toujours accompagné de sa couleur, bien visible (sans colorer tout le fond).
- Une barre de progression façon jeu télé, qui montre les points en jeu par rapport au maximum du thème.
- Une animation spéciale avant une question extrême, dans l'esprit de l'écran de mort d'Among Us (l'esprit, pas les visuels du jeu).
- Des petits bruitages, aucune musique.

### Le panneau « i » du présentateur

Un bouton « i » dans un coin de l'écran présentateur ouvre un panneau d'informations :

- questions restantes, thèmes terminés, thèmes pas commencés ;
- durée de la partie, équipe en tête ;
- nombre d'écrans joueurs connectés ;
- tentatives de triche : le « i » devient rouge à chaque nouvelle tentative, puis redevient normal une fois le panneau ouvert.

### Rejoindre l'écran joueurs

- Une page avec un champ de saisie du code, un lien qui contient le code, ou le QR code.
- Aucun compte, aucun pseudo, aucune limite de nombre.
- Après un rechargement, l'écran revient exactement là où il était.

## 8. Matrice des actions du présentateur

Chaque action du présentateur est listée avec son effet à l'écran, sa confirmation et son enregistrement. Les actions irréversibles ou à fort impact demandent une confirmation. C'est une proposition à valider ligne par ligne.

| Action | Moment | Visible à l'écran joueurs | Confirmation | Enregistrée |
| --- | --- | --- | --- | --- |
| Créer la partie | Préparation | Non (aucun écran connecté) | Non | Oui |
| Renommer la partie | Préparation | Oui, à la sortie du champ | Non | Oui |
| Modifier une option | Préparation | Oui | Non | Oui |
| Ajouter ou retirer un thème | Préparation | Oui | Non | Oui |
| Lancer ou relancer le tirage | Préparation | Oui (nombre de questions) | Oui si un tirage existe | Oui |
| Créer ou renommer une équipe | Préparation | Oui, à la sortie du champ | Non | Oui |
| Supprimer une équipe | Préparation | Oui | Oui | Oui |
| Choisir une couleur | Préparation | Oui | Non | Oui |
| Ajouter ou retirer un membre | Préparation | Oui | Non | Oui |
| Modifier l'ordre de passage | Préparation | Oui | Non | Oui |
| Modifier le score cible | Préparation et jeu | Oui | Non | Oui |
| Lancer la partie | Préparation | Oui | Oui | Oui |
| Supprimer un brouillon | Préparation | Non | Oui | Oui |
| Choisir le thème de l'équipe | Jeu | Oui | Non | Oui |
| Afficher la question | Jeu | Oui (énoncé et chrono) | Non | Oui |
| Juger Juste, Demi ou Bonus | Jeu | Oui | Non | Oui |
| Juger Faux | Jeu | Oui | À trancher | Oui |
| Continuer ou s'arrêter | Jeu | Oui | Non | Oui |
| Annuler la question | Jeu | Oui | Oui | Oui |
| Passer le tour | Jeu | Oui (tour suivant, sans motif) | Oui | Oui |
| Mettre une équipe en pause ou la réactiver | Jeu | Oui | Oui | Oui |
| Ajuster des points | Jeu et fin | Oui | Oui | Oui |
| Afficher l'accueil ou le classement | Jeu | Oui | Non | Oui (scène) |
| Mettre en pause ou reprendre la partie | Jeu | Oui | Non | Oui |
| Terminer la partie | Jeu | Oui | Oui | Oui |
| Reprendre après une victoire | Fin | Oui | Oui | Oui |
| Passer en hors compétition | Fin | Oui | Oui | Oui |
| Clôturer la partie | Fin | Oui (fin de l'accès) | Oui | Oui |
| Télécharger la fiche PDF de secours | Après le tirage | Non | Non | Non |

## 9. Sécurité et anti-triche

Les joueurs seront des informaticiens curieux : tout ce qui arrive dans leur navigateur doit être considéré comme lu. La règle d'or est donc de ne jamais envoyer une donnée que l'écran ne doit pas montrer.

### Deux API séparées

- **API présentateur** : authentification obligatoire, et vérification à chaque requête que l'utilisateur est le propriétaire de la partie.
- **API joueurs** : accès par le code uniquement, et renvoie une projection publique de la partie.
- Ce sont deux familles de routes distinctes, pas une seule route avec un paramètre « mode ». Un oubli de filtre ne peut ainsi pas faire fuiter de réponse.

### Ce que reçoit l'écran joueurs

| Donnée | Quand elle est envoyée |
| --- | --- |
| Énoncé d'une question | Dès qu'elle a été affichée par le présentateur |
| Niveau de la question en cours ou suivante | Au choix du thème et au moment de décider de continuer |
| Niveaux des autres questions d'un thème | Jamais : la répartition reste un mystère |
| Nombre de questions restantes d'un thème | Toujours |
| Réponse et explication | Dans la scène « Bonne réponse », puis en permanence une fois la question validée |
| Réponse d'une question ratée ou en suspens | Jamais pendant la compétition |
| Questions annulées, notes privées, identifiants de la banque | Jamais |

### Le code de partie

- 8 caractères tirés d'un alphabet sans ambiguïté (sans 0, O, 1, I, L), soit 31 symboles et environ 850 milliards de combinaisons.
- Valide de la création jusqu'à la clôture de la partie.
- Après 15 codes erronés depuis une même adresse IP, la saisie est bloquée 5 minutes, avec un message dédié.

### Le lien de récapitulatif

- Permanent, distinct du code, avec un jeton aléatoire d'une vingtaine de caractères dans l'URL.
- Il protège des données non personnelles : un jeton non devinable suffit, sans authentification.
- Il montre le classement, les thèmes et les questions validées avec leurs réponses. Les membres n'y apparaissent que par leur initiale.

### La page « Bien essayé »

- Elle s'affiche quand un joueur tente d'ouvrir une adresse interdite pendant la partie : une route du présentateur, ou les données d'une question pas encore validée.
- Elle renvoie un code HTTP 403, et chaque tentative fait passer le « i » du présentateur au rouge.

### Identifiants : UUID ou entiers ?

Tu as raison sur le fond : deviner un identifiant ne sert à rien si chaque route vérifie les droits. C'est la vérification qui protège, pas l'identifiant. Les entiers qui se suivent ont seulement deux défauts :

- **Si une vérification est oubliée une seule fois**, il suffit de changer le nombre dans l'URL pour lire les données des autres (une faille dite « IDOR »). Avec un UUID, la même faille est inexploitable en pratique.
- **Ils révèlent des informations**, comme le nombre de parties ou de questions créées.

**Décision proposée** : des entiers en interne, comme dans le reste de l'application. Les joueurs n'en voient jamais : ils ne manipulent que le code de partie et le jeton du récapitulatif. Côté présentateur, les entiers sont acceptables puisque toutes ses routes vérifient le propriétaire.

### Thèmes publics

Un thème public n'expose que son nom, son emoji et sa couleur. Les questions restent toujours privées à leur auteur, donc personne ne peut lire les questions du présentateur avant la soirée.

## 10. Fonctionnalités

Tout ce qui suit est visé pour la soirée. L'ordre donne la séquence de construction : le socle jouable d'abord, le reste ensuite. Les « idées à éprouver » sont des pistes à argumenter plus tard, pas des engagements.

### 1. Le socle jouable (à construire en premier)

| Domaine | Fonctionnalité |
| --- | --- |
| Banque | Créer, modifier, supprimer ses thèmes (nom, emoji, couleur, privé par défaut ou public) |
| Banque | Créer, modifier, supprimer ses questions (énoncé, réponse, niveau, explication en Markdown) |
| Partie | Créer une partie, régler les options, choisir les thèmes, tirage équilibré |
| Partie | Équipes (nom, couleur unique, membres) et ordre de passage |
| Partie | Score cible calculé, affiché avec son calcul, modifiable |
| Jeu | Choix du thème, affichage de la question, chrono visuel avec son à zéro |
| Jeu | Jugement Juste, Demi-points, Bonus, Faux, puis Continuer ou S'arrêter |
| Jeu | Encaissement automatique à la fin d'un thème, thèmes terminés grisés |
| Jeu | Ajustements de points, fin manuelle, classement, victoire |
| Écrans | Écran joueurs par code ou lien, mode « suivre », synchronisé en temps réel par scènes |
| Écrans | Retour au bon endroit après rechargement |
| Écrans | Interface TV très lisible depuis le salon, interface présentateur pour tablette et téléphone |
| Sécurité | Projection publique sans données interdites, blocage après 15 codes erronés |

### 2. Ensuite, avant la soirée

| Domaine | Fonctionnalité | Idée d'origine |
| --- | --- | --- |
| Banque | Menu principal, page d'un thème avec filtres | n° 49, 62 |
| Banque | Import et export JSON et CSV, avec aperçu avant validation | n° 49, 62 |
| Partie | Exclusion des questions déjà utilisées, parties de test | n° 49, 64 |
| Partie | Liste des parties par statut, pause et reprise, duplication | n° 13, 65 |
| Partie | Fiche PDF de secours | n° 60 |
| Jeu | Annuler une question, remplacement par la réserve | réponse 9, n° 49 |
| Jeu | Passer un tour, mettre une équipe en pause ou la réactiver | réponses 3.10, 8 |
| Jeu | Confirmations selon la matrice des actions | n° 51 |
| Jeu | Hors compétition après la fin, clôture de la partie | n° 56 |
| Jeu | Chrono avec pause, reprise et ajout de temps | n° 17 |
| Écrans | Accueil de la partie en navigation libre, questions validées consultables | réponse 16, section 9 |
| Écrans | Code et QR code permanents sur la TV | n° 46 |
| Écrans | Barre de progression façon jeu télé, couleur de l'équipe active | n° 52, 53 |
| Écrans | Animations : confettis à l'encaissement, tremblement à l'erreur, annonce de question extrême | n° 21, 54 |
| Écrans | Bruitages (bonne réponse, mauvaise réponse, fin du chrono) | n° 22 |
| Présentateur | Panneau « i » avec compteur de triche, notes privées par question | n° 15, 55, 57, 58 |
| Présentateur | Indicateur des écrans joueurs connectés | n° 48 |
| Sécurité | Page « Bien essayé » | réponse 3.20 |
| Après la partie | Récapitulatif, historique, lien de partage permanent | n° 36, 37, 39 |
| Après la partie | Anonymisation des membres (initiale du prénom) | n° 45 |

### 3. Idées à éprouver

- Annuler et rétablir n'importe quelle action (n° 11, 43), à confirmer : le journal d'événements la rend possible plus tard.
- Variante « série à reconstruire » (réponse 3.1).
- Bouton indice (n° 3).
- Thème bonus à points doublés (n° 4).
- Finale en duel entre les deux meilleures équipes (n° 8).
- Questions image, audio, vidéo : blind test, bruit d'animal, code de la route (n° 19, 30, réponse 3.15).
- Rejouer avec les mêmes équipes (n° 38).
- Jeu bonus de départage intégré à l'application, façon jeu mystère de la Zlan.

### 4. Rejeté

Joker (1), indice payant (2), mode rapide (5), manches (6), pénalité d'erreur (7), choix du thème par l'adversaire (9), mode préparation (14), raccourcis clavier (16), mode daltonien (24), thème sombre ou clair (25), duplication de thème (28), tags (32), vérification de difficulté (34), variantes de réponses (35), statistiques par question (40), miniature de la TV (47), fil des actions (50), mur de la honte (57, remplacé par le compteur du « i »), aperçu TV de l'explication (63), musique (66). La revue des questions avant le lancement est retirée.

## 11. Modèle conceptuel de données

Le modèle tient en trois blocs : la banque (thèmes et questions), la copie figée de la partie, et un journal d'événements qui raconte la partie. Il n'est pas encore validé et évoluera.

&#91;embedded content: tables du Tunnel · banque, partie, journal\]

Les flèches pleines vont d'un parent vers ses enfants (un vers plusieurs). Les pointillés sont la copie faite au tirage : c'est le seul moment où la partie lit la banque.

### Les choix déjà tranchés

- **Copie plutôt que verrouillage** : au tirage, les thèmes et questions sont recopiés dans la partie, comme une facture recopie le prix du produit. Modifier ou supprimer une question de la banque ne touche jamais une partie.
- **Trois états d'une question** : une seule colonne `state` (`to_play`, `pending`, `validated`) plutôt que deux colonnes qui permettraient une combinaison impossible.
- **Points obtenus stockés** au moment du jugement, puisque les demi-points et les bonus se décident à ce moment-là.
- **Score calculé, jamais stocké** : points obtenus des questions validées par l'équipe, plus ses ajustements.

### Ce qui change depuis la v2

- **`tunnel_question` retrouve un `user_id`.** En v2, je l'avais retiré en supposant que l'auteur d'une question était le propriétaire de son thème. C'est faux depuis que plusieurs utilisateurs peuvent ranger leurs questions dans un même thème public.
- **L'explication est stockée en Markdown**, plus en JSON : l'IA, l'import et l'export la manipulent directement (voir les notes techniques).
- **Nouveaux réglages de partie** : exclusion des questions utilisées, partie de test, jeton du récapitulatif. Le coefficient du score cible quitte la base pour une constante du code.
- **Question utilisée** : une colonne `used_at` sur la question, remplie à son premier affichage dans une partie qui n'est pas de test. Le filtre du tirage reste ainsi une requête simple.
- **Réserve** : les questions non tirées ne sont pas copiées d'avance. Une question de remplacement est copiée au moment où elle sert.

### Pourquoi garder le journal d'événements

Même si l'annulation des actions passe dans les idées à éprouver, le journal reste le meilleur choix :

- **Reprise** : après un rechargement ou une coupure, l'état se reconstruit à l'identique.
- **Hors compétition** : les événements postérieurs à la fin officielle sont simplement ignorés dans le calcul du score.
- **Récapitulatif** : les temps forts se lisent directement dans le journal.
- **Annulation plus tard** : marquer le dernier événement comme annulé et recalculer, sans toucher au reste du modèle.

Une partie compte au plus quelques centaines d'événements : les rejouer prend quelques millisecondes.

### Les tables

**Banque**

```
tunnel_theme
  id, user_id (propriétaire), name, icon (emoji), color,
  visibility (private par défaut | public), created_at, updated_at

tunnel_question
  id, user_id (auteur), theme_id, difficulty (1-4),
  statement, answer, explanation (Markdown),
  used_at?, created_at, updated_at
```

**Partie et configuration**

```
tunnel_game
  id, user_id, name, code (8 car., unique),
  status (draft | running | paused | finished | closed),
  timer_enabled, max_questions_per_theme (10),
  exclude_used_questions, is_test,
  target_score (null = valeur calculée), recap_token (unique),
  winner_team_id?, created_at, drawn_at?, started_at?, finished_at?

tunnel_team
  id, game_id, name, color (clé de la palette), play_order
  UNIQUE (game_id, color), UNIQUE (game_id, play_order)

tunnel_team_member
  id, team_id, name (réduit à l'initiale à la fin)
```

**Copie figée au tirage**

```
tunnel_game_theme
  id, game_id, source_theme_id? (SET NULL si supprimé),
  name, icon, color, position (ordre sur le plateau)

tunnel_game_question
  id, game_theme_id, source_question_id? (SET NULL),
  position, difficulty, points, timer_seconds,
  statement, answer, explanation,
  replaces_game_question_id? (si remplacement)
  -- cache facultatif : state, points_awarded, validated_by_team_id
```

**Journal**

```
tunnel_game_event
  id, game_id, seq (UNIQUE par partie), type,
  payload (JSON), created_at, undone_at?
```

### Les types d'événements

| Type | Contenu | Effet |
| --- | --- | --- |
| `theme_chosen` | équipe, thème | Ouvre un tour |
| `question_shown` | question, heure d'affichage | Révèle l'énoncé, démarre le chrono, marque la question utilisée |
| `answer_judged` | question, verdict (juste, demi, bonus, faux), points obtenus | Met la question en suspens, ou ferme le tour si faux |
| `streak_banked` | équipe, thème | Valide les questions en suspens du thème |
| `question_cancelled` | question, remplaçante éventuelle | Retire la question sans pénalité |
| `turn_passed` | équipe | Passe la main |
| `team_paused`, `team_resumed` | équipe | Retire ou remet l'équipe dans la rotation |
| `score_adjusted` | équipe, points, motif | Ajoute ou retire des points |
| `timer_paused`, `timer_resumed`, `timer_extended` | secondes | Agit sur le chrono |
| `scene_changed` | scène | Change l'écran « suivre » sans toucher au jeu |
| `game_paused`, `game_resumed` | motif (manuel ou victoire) | Change le statut |
| `game_finished` | équipe gagnante | Fige le classement officiel |
| `game_closed` | aucun | Invalide le code |

## 12. Notes techniques

SSE suffit pour pousser les mises à jour, ton idée de « messages » qui transitent par l'API sans passer par la base est la bonne, et le chrono ne dépend pas de la vitesse du serveur.

### SSE, WebSocket ou polling

| Technique | Principe | Pour Le Tunnel |
| --- | --- | --- |
| Polling | Le navigateur redemande l'état toutes les X secondes | Simple mais en retard d'autant, et gaspille des requêtes |
| **SSE** | Le serveur garde une connexion ouverte et pousse les mises à jour, dans un seul sens | **Idéal** : l'écran joueurs ne fait que recevoir, et le navigateur se reconnecte tout seul |
| WebSocket | Connexion ouverte dans les deux sens | Inutile : les actions du présentateur passent très bien par des requêtes HTTP classiques |

### Synchroniser les deux écrans

Chaque action suit le même chemin : le présentateur envoie une requête HTTP, le serveur enregistre si besoin, publie un message sur le canal de la partie, puis le flux SSE le transmet aux écrans abonnés. Trois sortes de messages circulent :

| Sorte | Exemple | Enregistré en base |
| --- | --- | --- |
| Événement de jeu | Un jugement, un encaissement | Oui, dans le journal |
| Modification de configuration | Un nom d'équipe, à la sortie du champ | Oui, dans les tables |
| Message éphémère | Surligner sur la TV le thème que l'équipe hésite à choisir | Non : le serveur le relaie sans l'enregistrer |

Un écran qui se reconnecte ne reçoit pas les messages éphémères passés, ce qui est voulu : ils n'ont de sens que sur le moment. Un canal en mémoire du serveur (un simple émetteur d'événements) suffit tant qu'il tourne en une seule instance. Avec plusieurs instances, il faudrait un relais comme Redis.

### Le flux SSE et les déconnexions

- Le serveur tient un registre des écrans abonnés à chaque partie.
- Dès qu'une connexion se ferme (événement de fermeture de la requête), l'écran est retiré du registre.
- Un message de maintien part toutes les 15 secondes environ. S'il échoue à s'écrire, la connexion est morte et l'écran est retiré. Il empêche aussi un proxy de couper une connexion silencieuse.
- Sans aucun abonné, le serveur ne calcule plus de projection pour cette partie.
- À chaque mise à jour, le serveur pousse la projection entière (quelques kilo-octets). À la connexion et à chaque reconnexion, l'écran reçoit l'état complet.
- Derrière un reverse proxy, il faut désactiver la mise en tampon des réponses (avec nginx : en-tête `X-Accel-Buffering: no`).
- **Bibliothèques** : côté navigateur, l'`EventSource` natif suffit. Côté serveur, à choisir selon le framework : `better-sse` (Node et Express), l'assistant `streamSSE` de Hono, ou le plugin SSE de Fastify.

### Le chrono

- Le serveur n'envoie pas « il reste 30 s » mais « question affichée à 22:41:07.250, durée 30 s ».
- Chaque objet envoyé contient aussi l'heure du serveur. L'écran calcule l'écart avec sa propre horloge et en déduit le temps restant.
- Le retard du SSE ne décale donc que l'apparition de la question, jamais l'heure de fin. La TV et le présentateur affichent le même zéro.
- La pause et l'ajout de temps sont des événements : le temps restant se recalcule à partir d'eux.
- Le son de fin est joué localement par chaque écran.

### Le son sur la TV

Les navigateurs bloquent le son tant que l'utilisateur n'a pas cliqué sur la page. L'écran joueurs affiche donc un bouton « Activer le son » au premier chargement.

### Les doubles clics du présentateur

Chaque action envoie le numéro du dernier événement connu. Si le serveur en a déjà un plus récent, il refuse l'action. Un double tap sur « Juste » ne valide donc pas deux fois.

### L'explication en Markdown

- Le Markdown couvre tous les besoins : liens, listes à puces, gras, images par URL (`![](https://…)`).
- Une IA l'écrit nativement, et il passe tel quel dans un JSON ou un CSV d'import.
- L'affichage utilise un moteur qui ignore le HTML brut (par exemple `react-markdown` sans son extension HTML). Cela ferme la porte aux injections de script.
- Les images ne sont pas stockées en base : seule leur URL l'est.

### La fiche PDF de secours

Générée à partir de la copie figée, dès le tirage : pour chaque thème, dans l'ordre de jeu, le niveau, l'énoncé, la réponse et les points.

## 13. À préparer de ton côté

Pour que je comprenne tes idées d'écrans sans ambiguïté, voici les formats les plus fiables. Je peux en générer des premières versions que tu corrigeras.

- **Enchaînements d'écrans** : en Mermaid (`flowchart` ou `stateDiagram`). C'est du texte, donc je le lis exactement.
- **Maquettes d'écrans** : dans Excalidraw, exportées en `.excalidraw` (un JSON que je lis précisément). Une image annotée fonctionne en secours, mais les positions et les textes y sont moins fiables.
- **User stories** : du texte simple, au format « En tant que présentateur, je… pour… ».
- **Contenu** : rédiger les thèmes et questions de la soirée (environ 20 par thème), éventuellement avec une IA, puis les importer.
