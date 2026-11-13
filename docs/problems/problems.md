# Problèmes connus

[Citadel](../../README.md) › Problèmes connus

## Auth et profil
1. Le profil est trop grand : sur petit écran on s'y perd. Le rendre plus compact.

# Performance
2. Ajout d'un jeu au backlog : délai visible entre la fin des requêtes et l'apparition du jeu dans le tableau (piste : cache TanStack Query).
3. Chaque mise à jour du tableau recharge le tableau entier (toutes les pages déjà chargées), ce qui coûte cher sur un grand backlog.
4. Mémoire : l'onglet prend ~102 Mo avec la première page du scroll infini, ~750 Mo avec toutes les pages (mesuré après rechargement), et les requêtes deviennent bien plus lentes. Pas reproductible à 100 %. Mesure faite avec 132 jeux en base, 130 au backlog, 176 versions. Piste : aucune virtualisation, toutes les lignes sont dans le DOM.
5. La base est sur un SSD rapide : lui allouer un gros cache (buffer pool MariaDB) pour accélérer les requêtes.
6. Console d'administration : temps de réponse par endpoint (tableau en millisecondes), ou tout moyen plus simple de repérer les points lents.

---

# Pour plus tard
- **Types de fin et statuts personnalisables.** Chaque utilisateur gère sa propre liste de types de fin (nom, description) et sa propre liste de statuts (nom, description). Un statut vaut pour tous les types de fin ou pour certains seulement. Il porte une propriété « représente un jeu fini, d'une manière ou d'une autre », qui remplace la liste fixe des statuts de fin.
