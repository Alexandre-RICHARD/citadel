# Citadel

## Client
### Pour lancer ce projet :
#### Prérequis
- Remplir le .env à partir du .env.example en cohérence avec le projet back
- Installer Node
- Activer corepack avec `corepack enable`

#### Démarrage
- Installer les dépendances
- Exécuter le script `start`

## Server
### Pour lancer ce projet :
#### Prérequis
- Remplir le .env à partir du .env.example en cohérence avec le projet front
- Installer MariaDB
- Installer Docker ou Docker Desktop
- Installer Node

#### Démarrage
- Exécuter le script `init-db`
- Exécuter le script `migrate`
- Installer les dépendances
- Lancer avec `start`

## TODO
- Ajouter des tests (unitaire uniquement)
https://claude.ai/chat/9c73847f-79d7-4408-9eab-9601d0975968 
- On va enfin implémenter le front
- On va faire des tests end to end
- Faire le système de tous est en 1 rem = 10px. Mais il faut y appliquer un système pour que l'utilisateur puisse "zoomer"
- Rendre précis le undefined. ? | undefined, ou les 2 mais le sens doit être différent
  - Préféré des valeurs null pour les input
  - En fait, c'est déjà activé. Préféré le fait de ne jamais avoir de type en undefined explicite. Une propriété optionnelle doit être marqué en ?. Une propriété qui peut être nulle doit être marqué en null.
- Refaire entièrement le thème
- Refonte du système de traduction
- Virer lucide-react
- Les media queries ne doivent jamais utilisées de rem, mais resté en taille d'écran abolsue à priori
- Faire des data-portal avec tout les éléments de type : tooltip, modal, dropdown
- Claude a répéré "Un bug repéré en passant dans DeathRow, non corrigé. Le champ de date est en datetime-local, mais toDateInputValue renvoie seulement AAAA-MM-JJ, une valeur que ce type de champ refuse. Le champ s'affiche donc vide, et enregistrer une mort sans toucher à la date remet son heure à minuit UTC. C'est à régler quand tu brancheras gameDeathCounter sur l'API."
- + point bonus : avec les collègues on a vu que c'était bien que les tests d'intégration ne nettoie pas leurs données de tests avant ou après l'exécution individuelle. La base ne doit être clean qu'au tout début des tests. Cela permet de s'assurer d'une meilleure compatibilité des endpoints les uns par rapport aux autres. Aussi, pour renforcer ça, les tests d'intégration doivent être joué dans un ordre aléatoire à chaque fois. Si un test échoue une fois, soit il est mal conçu, soit il a révélé une faille entre plusieurs endpoints.
- Transformer tout l'infra. Avoir des base uniquement en container docker. La base dev est persisté mais facile à vider. La base de test est reset à chaque fois.
