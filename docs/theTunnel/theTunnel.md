# Le Tunnel — Cahier des charges v2

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

## 2. Lexique

Ces mots ont un sens précis dans tout le document et dans le code. Les trois états d'une question (à jouer, en suspens, validée) sont le cœur du jeu.

### Le contenu

| Terme | Définition simple |
| --- | --- |
| **Thème** | Un groupe de questions sur un même sujet. Il a un nom, un emoji et une couleur. |
| **Question** | Un énoncé, une réponse et une explication facultative. Elle a un niveau. |
| **Niveau** | Facile, intermédiaire, difficile ou extrême. Il fixe les points et le temps de réponse. |
| **Banque** | L'ensemble des thèmes et questions créés par les utilisateurs, hors de toute partie. |

### La partie

| Terme | Définition simple |
| --- | --- |
| **Partie** | Une session de jeu. Ses questions sont tirées et figées à partir de la banque. |
| **Équipe** | Un groupe de joueurs avec un nom et une couleur. |
| **Membre** | Un joueur d'une équipe, identifié par un simple prénom. |
| **Plateau** | La vue d'ensemble des thèmes de la partie et de leur avancement. |
| **Tour** | Le moment où une équipe a la main. Il commence au choix d'un thème et se termine par un arrêt, une erreur, la fin du thème, un passage ou un forfait. |
| **Série** | Les bonnes réponses qu'une équipe enchaîne pendant son tour. |

### Les trois états d'une question

| État | Ce que ça veut dire | Exemple |
| --- | --- | --- |
| **À jouer** | Personne n'a encore réussi cette question. Une question ratée reste « à jouer ». | La question 6 que l'équipe A vient de rater. |
| **En suspens** | Une équipe y a répondu juste, mais ses points ne sont pas encore encaissés. | Les questions 3, 4 et 5 réussies par l'équipe A avant son erreur. |
| **Validée** | Ses points appartiennent définitivement à une équipe. | Les questions 1 et 2, encaissées plus tôt. |

### Les points

| Terme | Définition simple |
| --- | --- |
| **Question en cours** | La première question « à jouer » d'un thème. C'est toujours elle qu'on pose quand on choisit ce thème. |
| **Cagnotte** | La somme des points des questions en suspens d'un thème. Elle appartient au thème, pas à une équipe : elle survit aux erreurs. |
| **Points en jeu** | La cagnotte plus les points de la question en cours. C'est ce que gagne l'équipe qui réussit puis s'arrête. |
| **Encaisser** | S'arrêter et transformer la cagnotte en points définitifs. Les questions en suspens deviennent validées. |
| **Remise en jeu** | Après une erreur, la cagnotte reste dans le thème. L'équipe qui réussit ensuite la question en cours la récupère. |
| **Thème terminé** | Toutes ses questions sont validées. Il est grisé et ne peut plus être choisi. |
| **Score** | Les points des questions validées par l'équipe, plus ses ajustements. |
| **Ajustement** | Des points ajoutés ou retirés à la main par le présentateur (fin de partie, jeu bonus). |
| **Score cible** | Le score qui fait gagner automatiquement la première équipe qui l'atteint. |

### Les écrans

| Terme | Définition simple |
| --- | --- |
| **Présentateur** | L'utilisateur connecté qui a créé la partie. Lui seul agit. |
| **Écran joueurs** | L'écran en lecture seule, projeté sur la TV ou ouvert sur un téléphone. |
| **Scène** | Ce que l'écran joueurs affiche à un instant donné. Le présentateur la choisit, indépendamment de la page où il se trouve. |
| **Code de partie** | Un code de 8 caractères qui ouvre l'écran joueurs d'une partie. |
| **Forfait** | Une équipe qui abandonne. Elle ne joue plus de tour. |

## 3. Règles du jeu

Une équipe joue un thème jusqu'à ce qu'elle s'arrête, se trompe ou le termine. La cagnotte d'un thème ne disparaît jamais : elle attend l'équipe qui réussira la question en cours.

### Niveaux (fixes, en dur dans le code)

| Niveau | Nom | Points | Temps |
| --- | --- | --- | --- |
| 1 | Facile | 1 | 20 s |
| 2 | Intermédiaire | 2 | 30 s |
| 3 | Difficile | 3 | 45 s |
| 4 | Extrême | 5 | 60 s |

Un thème peut contenir n'importe quelle combinaison de niveaux, y compris un seul niveau (thème vrai/faux à 1 point).

### Ordre de passage

- L'ordre est fixé avant la partie, par un mini-jeu dans la vraie vie. Le présentateur le saisit dans l'application.
- Les équipes jouent ensuite à tour de rôle, en boucle. Une équipe forfait est sautée.

### Déroulé d'un tour

1. **Choix du thème** : l'équipe active choisit un thème non terminé, y compris celui où elle vient d'échouer. L'écran joueurs montre le thème et la cagnotte, mais pas l'énoncé de la question en cours.
2. **Affichage** : le présentateur affiche la question. L'énoncé apparaît à l'écran et le chrono démarre (si l'option est active).
3. **Fin du chrono** : un son retentit. Rien n'est automatique, le présentateur refuse les réponses tardives.
4. **Jugement** : le présentateur choisit Juste, Demi-points, Bonus ou Faux.
5. **Si la réponse est juste** (ou demi, ou bonus) : la question passe en suspens, et la réponse et son explication s'affichent. Puis :
   - si c'était la dernière question du thème, la cagnotte est encaissée automatiquement et le tour passe ;
   - sinon, l'équipe choisit de **s'arrêter** (elle encaisse, le tour passe) ou de **continuer** (question suivante, sans savoir ce qu'elle sera).
6. **Si la réponse est fausse** : la réponse reste cachée. La question reste à jouer, la cagnotte reste dans le thème, et le tour passe.
7. **Passer** : le présentateur peut faire passer le tour d'une équipe (bouton discret, non annoncé aux joueurs).
8. **Forfait** : une équipe peut abandonner à tout moment. Elle ne joue plus.

&#91;embedded content: déroulé d'un tour · 3 décisions\]

Un tour se termine toujours par « Tour suivant » : sur une erreur, la cagnotte reste dans le thème ; sur un arrêt ou la fin du thème, elle est encaissée.

### Exemple complet

Thème A, 8 questions : Q1 et Q2 valent 1 point, Q3 et Q4 valent 2, Q5 et Q6 valent 3, Q7 et Q8 valent 5. Rouge a déjà validé Q1 et Q2.

| Étape | Ce qui se passe | Cagnotte du thème A | Scores |
| --- | --- | --- | --- |
| 1 | Bleu réussit Q3, Q4 et Q5, et continue | 7 (Q3 à Q5 en suspens) | Rouge 2, Bleu 0, Vert 0 |
| 2 | Bleu rate Q6. Q6 reste à jouer, la réponse reste cachée | 7 | inchangés |
| 3 | Vert choisit le thème A : on lui pose Q6. Il réussit | 10 (Q3 à Q6 en suspens) | inchangés |
| 4a | Vert s'arrête : Q3 à Q6 deviennent validées par Vert | 0 | Rouge 2, Bleu 0, Vert 10 |
| 4b | Ou bien Vert continue et rate Q7 : tout reste en suspens pour la prochaine équipe | 10 | inchangés |

### Option de partie : « série à reconstruire »

Variante plus exigeante (à confirmer pour le POC) : l'équipe qui reprend un thème doit d'abord répondre juste à toutes les questions en suspens avant de pouvoir tenter la question en cours. Voir la question ouverte sur les réponses déjà révélées.

## 4. Score cible et fin de partie

Le score cible est proposé par un calcul, affiché avec son détail, puis modifiable. En pratique, la partie se terminera surtout à la main, et c'est voulu.

### Le calcul proposé

```latex
\text{cible} = \left\lceil \frac{\text{points possibles} \times 95\,\%}{\text{nombre d'équipes}} \right\rceil
```

- **Points possibles** : la somme des points de toutes les questions de la partie (hors demi-points et bonus).
- **Exemple** : 300 points, 6 équipes, 300 × 0,95 / 6 = 47,5, donc une cible de **48 points**.
- **Pourquoi ça ne bloque jamais** : si tous les points sont distribués, au moins une équipe a la moyenne (50 ici), qui dépasse la cible. C'est le principe des tiroirs.
- **La limite** : cette garantie ne joue qu'une fois presque tous les points encaissés. Or les questions extrêmes sont faites pour être rarement trouvées. La cible ne sera donc atteinte que si une équipe domine nettement.
- **Conséquence** : la fin manuelle sera le cas normal. Le coefficient (95 % par défaut) devient un réglage de la partie, pour viser une partie plus courte si besoin.

La cible se calcule en dernier, une fois les thèmes, les questions et les équipes configurés. Elle se recalcule si la configuration change, tant que le présentateur ne l'a pas modifiée à la main.

### Les trois fins possibles

| Fin | Déclencheur | Ce qui se passe |
| --- | --- | --- |
| **Cible atteinte** | Une équipe encaisse et atteint la cible | L'application propose la scène de victoire, le présentateur confirme (annulable) |
| **Fin manuelle** | Le présentateur clique sur « Terminer la partie » (manque de temps, lassitude, questions épuisées) | Affichage du classement, l'équipe en tête gagne |
| **Égalité en tête** | Deux équipes ou plus à égalité lors d'une fin manuelle | Un jeu bonus hors application les départage, et le présentateur saisit les points gagnés en ajustement |

### Ajustements

- Sur l'écran de classement, le présentateur peut ajouter ou retirer des points à une équipe, avec un motif court (« jeu bonus », « fair-play »).
- Un ajustement compte dans le score comme des points encaissés. Il est annulable comme toute action.

## 5. Configuration d'une partie

Une partie se prépare en étapes, dans cet ordre, et peut être sauvegardée à tout moment sans être lancée. Le code d'invitation existe dès la création : les joueurs voient la préparation en direct, sans jamais voir les questions.

### Les étapes

1. **Création** : le présentateur nomme la partie. Le code et le lien d'invitation sont générés.
2. **Options** : chrono activé ou non, nombre maximum de questions par thème, variante « série à reconstruire », coefficient du score cible.
3. **Thèmes** : le présentateur choisit parmi ses thèmes et les thèmes publics. Un thème qui a moins de questions que le maximum reste sélectionnable, avec un indicateur. L'écran joueurs affiche les thèmes choisis et leur nombre de questions.
4. **Tirage** : pour chaque thème, l'application tire au plus N questions. Elles sont classées par niveau croissant, dans un ordre aléatoire au sein d'un même niveau, puis copiées dans la partie.
5. **Revue des questions** : le présentateur ouvre un thème pour bannir une question (remplacée par une autre si possible) ou relancer le tirage. L'écran joueurs ne suit pas cette étape.
6. **Équipes** : nom, couleur choisie dans une palette d'environ 30 teintes (une couleur par équipe), et membres. Deux équipes minimum, pas de maximum.
7. **Ordre de passage** : saisi à la main après le mini-jeu de la vraie vie.
8. **Score cible** : valeur calculée, affichée avec son calcul, modifiable.
9. **Lancement** : la partie passe « en cours ».

### Options de partie

| Option | Valeurs | Par défaut |
| --- | --- | --- |
| Chrono | activé ou désactivé | activé |
| Questions max par thème | 1 ou plus | à définir |
| Série à reconstruire | activée ou désactivée | désactivée |
| Coefficient du score cible | en % | 95 % |
| Score cible | nombre entier | calculé |

### Statuts d'une partie

| Statut | Sens |
| --- | --- |
| Brouillon | Préparée, pas encore lancée |
| En cours | Les tours se jouent |
| En pause | Interrompue, reprenable plus tard |
| Terminée | Classement figé, récapitulatif disponible |

La page d'accueil du Tunnel liste les parties du présentateur par statut : brouillons, en pause, en cours, terminées.

## 6. Écrans et synchronisation

L'écran joueurs n'affiche pas « la page du présentateur » : il affiche une **scène**, que le présentateur fait évoluer par ses actions. Ce découplage règle d'un coup la synchronisation et la sécurité.

### Les deux écrans

| Écran | Utilisateur | Support | Droits |
| --- | --- | --- | --- |
| Présentateur | Le créateur de la partie, connecté | Tablette ou téléphone (responsive) | Toutes les actions |
| Joueurs | Toute personne qui a le code, sans compte | TV en priorité, téléphone en bonus | Lecture seule |

### Pourquoi des scènes

- Le présentateur navigue librement : il peut ouvrir un thème pour bannir une question sans que la TV le suive.
- Certaines actions changent la scène automatiquement (afficher une question, juger une réponse). Les autres non.
- Le serveur construit les données de l'écran joueurs à partir de la scène et de l'état public de la partie. Il n'envoie donc que ce que la scène doit montrer.

### Les scènes

| Scène | L'écran joueurs affiche | Déclenchée par |
| --- | --- | --- |
| Accueil | Nom de la partie, code, « en attente » | Création de la partie |
| Préparation | Thèmes choisis et leur nombre de questions, équipes, couleurs, membres, ordre, score cible | Modifications de configuration |
| Plateau | Tous les thèmes et leur avancement, cagnottes, scores, équipe active | Lancement, fin d'un tour, bouton « Plateau » |
| Thème choisi | Équipe active, thème, cagnotte, niveau de la question en cours (à confirmer) | Choix d'un thème |
| Question | Énoncé, niveau, points en jeu, chrono, équipe active | Bouton « Afficher la question » |
| Bonne réponse | Réponse, explication, nouvelle cagnotte | Jugement « Juste », « Demi » ou « Bonus » |
| Mauvaise réponse | « Faux », cagnotte remise en jeu, sans la réponse | Jugement « Faux » |
| Encaissement | Points encaissés, nouveau score | Arrêt ou fin du thème |
| Classement | Scores et ajustements | Bouton « Classement », fin manuelle |
| Victoire | Équipe gagnante, classement final | Cible atteinte confirmée ou fin manuelle |
| Pause | Écran d'attente | Mise en pause |

### Rejoindre l'écran joueurs

- Une page avec un champ de saisie du code, ou un lien qui contient le code et l'ouvre directement.
- Aucun compte, aucun pseudo. Deux ou trois écrans simultanés au maximum.
- Après un rechargement, l'écran revient exactement sur la scène en cours.

## 7. Sécurité et anti-triche

Les joueurs seront des informaticiens curieux : tout ce qui arrive dans leur navigateur doit être considéré comme lu. La règle d'or est donc de ne jamais envoyer une donnée que la scène ne montre pas.

### Deux API séparées

- **API présentateur** : authentification obligatoire, et vérification que l'utilisateur est le propriétaire de la partie à chaque requête.
- **API joueurs** : accès par le code uniquement, et renvoie une projection publique de la partie.
- Ce sont deux familles de routes distinctes, pas une seule route avec un paramètre « mode ». Un oubli de filtre ne peut ainsi pas faire fuiter de réponse.

### Ce que la projection publique ne contient jamais

- La réponse et l'explication d'une question tant que le présentateur ne l'a pas jugée juste.
- L'énoncé d'une question tant qu'elle n'a pas été affichée. Pour les questions à venir, seuls leur nombre et leur niveau sont connus.
- Les questions bannies, les notes privées du présentateur, les identifiants de la banque.

### Le code de partie

- 8 caractères tirés d'un alphabet sans ambiguïté (sans 0, O, 1, I, L), soit 31 symboles et environ 850 milliards de combinaisons.
- Valide tant que la partie n'est pas terminée (brouillon, en cours, en pause).
- Limitation à 15 essais de code par adresse IP (fenêtre de temps à définir).
- Les identifiants internes des parties sont des UUID, jamais des entiers qui se suivent.

### La page « Bien essayé »

- Toute tentative d'accès à une page ou une route présentateur sans en être le propriétaire mène à une page « Bien essayé », avec un code HTTP 403.
- Même chose pour un code invalide trafiqué dans l'URL après la limite d'essais.

### Le point de vigilance : les thèmes publics

Si un invité a un compte sur l'application, il peut lire les questions et réponses des thèmes publics avant la soirée. Les thèmes du nouvel an doivent donc être privés, ou « public » doit vouloir dire « utilisable sans être consultable ». Voir les questions ouvertes.

## 8. Fonctionnalités par priorité

P0 = indispensable le 31 décembre, P1 = si le temps le permet, Plus tard = après la soirée. Ce classement est une proposition à valider.

### P0 — le POC du nouvel an

| Domaine | Fonctionnalité |
| --- | --- |
| Banque | Créer, modifier et supprimer ses thèmes (nom, emoji, couleur, public ou privé) |
| Banque | Créer, modifier et supprimer ses questions (énoncé, réponse, niveau, explication en texte riche) |
| Partie | Créer une partie, régler les options, choisir les thèmes, tirer et revoir les questions, bannir une question |
| Partie | Équipes (nom, couleur de la palette, membres) et ordre de passage |
| Partie | Score cible calculé, affiché avec son calcul, modifiable |
| Partie | Liste des parties par statut, mise en pause et reprise |
| Jeu | Choix du thème, affichage de la question, chrono visuel avec son à zéro |
| Jeu | Jugement Juste, Demi-points, Bonus, Faux, puis Continuer ou S'arrêter |
| Jeu | Encaissement automatique à la fin d'un thème, thèmes terminés grisés |
| Jeu | Passer un tour, déclarer forfait |
| Jeu | Annuler et rétablir n'importe quelle action |
| Jeu | Ajustements de points, fin manuelle, classement, victoire |
| Écrans | Écran joueurs par code ou lien, synchronisé en temps réel par scènes |
| Écrans | Retour sur la bonne scène après rechargement |
| Écrans | Interface TV très lisible depuis le salon, interface présentateur pour tablette et téléphone |
| Sécurité | Projection publique sans réponses, 15 essais de code, page « Bien essayé » |

### P1 — si le temps le permet

| Fonctionnalité | Idée d'origine |
| --- | --- |
| Animations : confettis à l'encaissement, tremblement à l'erreur | n° 21 |
| Sons : bonne réponse, mauvaise réponse, chrono qui s'accélère | n° 22 |
| Cagnotte en barre de progression colorée | n° 23 |
| Questions validées colorées par équipe sur le plateau | n° 26 |
| Notes privées par question pour le présentateur | n° 15 |
| Chrono avec pause, reprise et ajout de temps | n° 17 |
| Récapitulatif de fin de partie et historique | n° 36, 37 |
| Lien public de partage du récapitulatif | n° 39 |
| Variante « série à reconstruire » | réponse 3.1 |
| Anonymisation des membres après la partie | n° 45 |

### Plus tard

- Bouton indice (n° 3).
- Thème bonus à points doublés (n° 4).
- Finale en duel entre les deux meilleures équipes (n° 8).
- Questions image, audio, vidéo : blind test, bruit d'animal, code de la route (n° 19, 30, réponse 3.15).
- Rejouer avec les mêmes équipes (n° 38).
- QR code pour rejoindre l'écran joueurs (n° 46, à confirmer).
- Jeu bonus de départage intégré à l'application, façon jeu mystère de la Zlan.

### Rejeté

Joker (1), indice payant (2), mode rapide (5), manches (6), pénalité d'erreur (7), choix du thème par l'adversaire (9), mode préparation (14, couvert par le statut brouillon), raccourcis clavier (16), mode daltonien (24), thème sombre ou clair (25), import et export (27), duplication de thème (28), tags (32), vérification de difficulté (34), variantes de réponses (35), statistiques par question (40). La bibliothèque publique (29) est remplacée par les thèmes publics.

## 9. Modèle conceptuel de données

Le modèle tient en trois blocs : la banque (thèmes et questions), la copie figée de la partie, et un journal d'événements qui raconte la partie. L'état du jeu se déduit du journal, ce qui rend l'annulation triviale. Ce modèle est une proposition, à valider plus tard.

&#91;embedded content: tables du Tunnel · banque, partie, journal\]

Les flèches pleines vont d'un parent vers ses enfants (un vers plusieurs). Les pointillés sont la copie faite au tirage : c'est le seul moment où la partie lit la banque.

### Critique de tes réponses

**2.1 — Verrouiller les questions plutôt que les copier ? Je recommande de rejeter.**

L'idée évite la duplication, mais elle crée plus de problèmes qu'elle n'en règle :

- **Thèmes publics** : tu ne peux pas verrouiller les questions d'un autre utilisateur. S'il les modifie ou les supprime, tes parties changent ou cassent.
- **Irréversibilité** : si on peut déverrouiller, le problème revient. Sinon, une faute de frappe découverte après une partie ne se corrige plus jamais.
- **Suppression impossible** : la banque s'encombre de questions mortes.
- **Le thème aussi** : son nom, son emoji et sa couleur devraient aussi être verrouillés.
- **La table de partie existe de toute façon** : elle porte l'ordre tiré au sort, les points et l'état. Y ajouter l'énoncé, la réponse et l'explication ne coûte que quelques kilo-octets par partie.

C'est le principe d'une facture : elle recopie le libellé et le prix du produit au moment de la vente, pour que l'historique ne change pas si le catalogue change. La copie se fait au tirage (étape 4 de la configuration).

**2.4 — Les trois états : tu avais raison, j'avais mal compris.** Deux ajustements :

- Deux colonnes (`answered` et `validated_by_team_id`) permettent une combinaison impossible : non répondue mais validée par une équipe. Une seule colonne `state` à trois valeurs l'empêche.
- Le mot « answered » est ambigu : une mauvaise réponse est aussi une réponse. D'où les noms `to_play`, `pending` (en suspens) et `validated`.
- Il faut aussi stocker les **points obtenus** au moment du jugement, puisque les demi-points et les bonus se décident à ce moment-là.

**2.9 — Le score.** D'accord : score = somme des points obtenus des questions validées par l'équipe + ses ajustements. Il est calculé dans le gros objet de la partie, jamais stocké.

**Annulation (idées 11 et 43).** Deux façons de faire :

| Approche | Principe | Annuler | Risque |
| --- | --- | --- | --- |
| **A. Journal seul (recommandée)** | Chaque action ajoute un événement. L'état est recalculé en rejouant les événements actifs | Marquer le dernier événement comme annulé, puis recalculer | Aucun : l'état ne peut pas diverger du journal |
| B. État + journal | Chaque action modifie l'état et écrit un événement avec l'état d'avant | Restaurer l'état d'avant | Deux sources de vérité qui peuvent diverger |

Une partie compte au plus quelques centaines d'événements : les rejouer prend quelques millisecondes. L'approche A supprime aussi les tables `tunnel_turn` et `tunnel_turn_answer` de la v1, car les tours se déduisent du journal. Les colonnes d'état de `tunnel_game_question` deviennent alors un simple cache facultatif.

### Les tables

**Banque**

```
tunnel_theme
  id (uuid), user_id, name, icon (emoji), color,
  visibility (public | private), created_at, updated_at

tunnel_question
  id (uuid), theme_id, difficulty (1-4),
  statement, answer, explanation (texte riche, JSON),
  created_at, updated_at
```

**Partie et configuration**

```
tunnel_game
  id (uuid), user_id, name, code (8 car., unique),
  status (draft | running | paused | finished),
  timer_enabled, max_questions_per_theme, rebuild_streak,
  target_coefficient (95 par défaut),
  target_score (null = valeur calculée),
  winner_team_id?, created_at, started_at?, finished_at?

tunnel_team
  id, game_id, name, color (clé de la palette), play_order
  UNIQUE (game_id, color), UNIQUE (game_id, play_order)

tunnel_team_member
  id, team_id, name
```

**Copie figée au tirage**

```
tunnel_game_theme
  id, game_id, source_theme_id? (SET NULL si supprimé),
  name, icon, color, position (ordre sur le plateau)

tunnel_game_question
  id, game_theme_id, source_question_id? (SET NULL),
  position, difficulty, points, timer_seconds,
  statement, answer, explanation
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
| `question_shown` | question, heure d'affichage | Révèle l'énoncé, démarre le chrono |
| `answer_judged` | question, verdict (juste, demi, bonus, faux), points obtenus | Met la question en suspens, ou ferme le tour si faux |
| `streak_banked` | équipe, thème | Valide les questions en suspens du thème |
| `turn_passed` | équipe | Passe la main |
| `team_forfeited` | équipe | Retire l'équipe de la rotation |
| `score_adjusted` | équipe, points, motif | Ajoute ou retire des points |
| `scene_changed` | scène | Change l'écran joueurs sans toucher au jeu |
| `game_paused`, `game_resumed`, `game_finished` | équipe gagnante pour la fin | Change le statut |

Si le présentateur annule puis fait une nouvelle action, les événements annulés sont définitivement abandonnés : on ne peut plus les rétablir, comme dans un éditeur de texte.

## 10. Notes techniques

SSE suffit, et le chrono ne dépend pas de la vitesse du serveur si l'on transmet une heure de départ plutôt qu'un décompte.

### SSE, WebSocket ou polling

| Technique | Principe | Pour Le Tunnel |
| --- | --- | --- |
| Polling | Le navigateur redemande l'état toutes les X secondes | Simple mais en retard d'autant, et gaspille des requêtes |
| **SSE** | Le serveur garde une connexion ouverte et pousse les mises à jour, dans un seul sens | **Idéal** : l'écran joueurs ne fait que recevoir, et le navigateur se reconnecte tout seul |
| WebSocket | Connexion ouverte dans les deux sens | Inutile : les actions du présentateur passent très bien par des requêtes HTTP classiques |

### Le flux de l'écran joueurs

- À chaque événement, le serveur recalcule la projection publique et pousse l'objet entier (quelques kilo-octets). Pas de calcul de différences à maintenir.
- À la connexion et à chaque reconnexion, l'écran reçoit l'état complet : un rechargement retombe donc sur la bonne scène.
- Un message de maintien toutes les 15 secondes environ évite qu'un proxy coupe la connexion. Derrière un reverse proxy, il faut aussi désactiver la mise en tampon des réponses (avec nginx : en-tête `X-Accel-Buffering: no`).

### Le chrono

- Le serveur n'envoie pas « il reste 30 s » mais « question affichée à 22:41:07.250, durée 30 s ».
- Chaque objet envoyé contient aussi l'heure du serveur. L'écran calcule l'écart avec sa propre horloge et en déduit le temps restant.
- Le retard du SSE ne décale donc que l'apparition de la question, jamais l'heure de fin. La TV et le présentateur affichent le même zéro.
- Le son de fin est joué localement par l'écran joueurs.

### Le son sur la TV

Les navigateurs bloquent le son tant que l'utilisateur n'a pas cliqué sur la page. L'écran joueurs affiche donc un bouton « Activer le son » au premier chargement.

### Les doubles clics du présentateur

Chaque action envoie le numéro du dernier événement connu. Si le serveur en a déjà un plus récent, il refuse l'action. Un double tap sur « Juste » ne valide donc pas deux fois.

### Le texte riche

L'explication est stockée au format JSON de l'éditeur (par exemple TipTap) et rendue en composants, sans injecter de HTML brut. Cela ferme la porte aux injections de script. Pour le POC, une image s'insère par son URL.
