# Game Death Counter

[Citadel](../../README.md) › Game Death Counter

Compteur de morts pour les jeux de type Souls, sur la route `/game-death-counter`, réservé aux comptes connectés. C'est l'implémentation de référence des règles de l'[architecture](../architecture/architecture.md) : en cas de doute, s'en inspirer.

## Sommaire

1. [Fonctionnement](#1-fonctionnement)
2. [Données](#2-données)
3. [Code](#3-code)
4. [Lancer](#4-lancer)

## 1. Fonctionnement

- Chaque jeu a ses boss, chaque boss ses morts, datées et commentées. Un bouton « Ajouter une mort (+1) » ajoute une mort à l'instant.
- Jeux triés par nom, boss dans l'ordre de création, morts par date. « Débuté le… » d'un boss est la date de sa première mort.
- Un boss se marque vaincu, un jeu terminé, avec leur date ; les deux se défont.
- Totaux : par boss, par jeu, et le total général dans l'en-tête. Tout suit immédiatement une mort ajoutée ou retirée (écritures optimistes).
- Supprimer un jeu ou un boss se confirme, en disant combien de morts partent avec ; une mort se supprime sans confirmation.
- Le détail d'un jeu ne se charge qu'à son dépliage, celui d'un boss au sien.

## 2. Données

| Table | Contenu |
|---|---|
| `gdc_game` | nom (255 caractères au plus), date de fin, `user_id` du propriétaire |
| `gdc_boss` | nom (255), date de victoire, `total_death` tenu à jour à chaque mort ajoutée ou retirée |
| `gdc_death` | date (jamais dans le futur), commentaire (1 000 caractères au plus) |

- Boss et morts partent en cascade avec leur jeu ; le jeu part avec son compte. La propriété d'un boss ou d'une mort se vérifie par jointure jusqu'à `gdc_game` ([authentification, §3.1](../auth/auth.md#31-tables-des-projets)) : le jeu, le boss ou la mort d'un autre compte répond `404`.
- Le total d'un jeu et le total général se calculent à la lecture.

Endpoints, sous `/api/game-death-counter`, tous `protected` :

| Endpoint | Rôle |
|---|---|
| `GET /games`, `POST /games` | Liste des jeux avec leurs totaux ; création |
| `GET /games/:id`, `PUT /games/:id`, `DELETE /games/:id` | Un jeu et ses boss ; renommer ; supprimer |
| `PATCH /games/:id/finished` | Terminé ou non |
| `POST /games/:gameId/bosses` | Ajouter un boss |
| `GET /bosses/:id`, `PUT /bosses/:id`, `DELETE /bosses/:id` | Un boss et ses morts ; renommer ; supprimer |
| `PATCH /bosses/:id/defeated` | Vaincu ou non |
| `POST /bosses/:bossId/deaths` | Ajouter une mort |
| `PATCH /deaths/:id`, `DELETE /deaths/:id` | Date et commentaire ; supprimer |

## 3. Code

- Specs : `packages/specs/src/projects/gameDeathCounter/`. Serveur : `apps/server/src/projects/gameDeathCounter/`, avec `userData/` pour la suppression et l'export des données d'un compte. Front : `apps/client/src/projects/gameDeathCounter/`, une seule page (`pages/Homepage`).
- Tables préfixées `gdc_` depuis V008 ; `user_id` depuis V021, qui a supprimé les jeux d'avant les comptes.

## 4. Lancer

Inclus dans Citadel, sans prérequis propre : voir [Lancer en local](../../README.md#2-lancer-en-local), puis http://localhost:3001/game-death-counter. Les scénarios end-to-end sont J1 à J5 des [scénarios](../e2e/scenarios.md).
