# Authentification de Citadel — Cahier des charges

30 octobre 2026 · v5 : dernières réponses intégrées, restauration et sujets d'infra passés au cahier de l'hébergement · v4 : réponses du 30 octobre intégrées · v3 : plus de MVP · v2 : aligné sur le dépôt · v1 : brouillon du 27 octobre

[Citadel](../../README.md) › Authentification : cahier des charges

Ce que l'authentification doit faire, ancré dans le code existant. Aucun code ici. Je code et tu relis. Prochaine étape : l'étape 1 de la roadmap (§15), après les mails de l'hébergement.

Dans la roadmap, **[toi]**, **[moi]** ou **[nous]** dit qui fait l'étape.

## Sommaire

1. Objectif, périmètre, mode de travail
2. Principes
3. Existant à réutiliser, écarts à corriger
4. Session et cookie
5. Données
6. Parcours, feature par feature
7. Anti-abus et sécurité transverse
8. Mail
9. Réglages et configuration
10. RGPD
11. Organisation du code
12. Ordre de construction et critères de fin
13. Après l'authentification
14. Risques
15. Roadmap
16. Questions
- Annexe : fichiers du repo à relire

---

## 1. Objectif, périmètre, mode de travail

### 1.1 Objectif

Des comptes utilisateurs partagés entre tous les projets, pour que la prod soit protégée et que les projets servent « pour de vrai ». Chaque utilisateur crée, modifie et supprime **ses** données sans jamais voir celles des autres. Aucun rôle, aucun privilège.

### 1.2 Livraison

- **Tout d'un coup**, sans MVP, comme la refonte de l'infra : fondations d'abord, parcours ensuite (§12).
- **Prérequis** : les mails du [cahier de l'hébergement](../ci_cd/cahier_des_charges.md) (envoi, `contact@`, DNS) sont en place.
- **Branche dédiée** pendant tout le chantier, mise à jour avec `main` régulièrement, puis fusionnée en gardant chaque commit (`git merge --no-ff`).
- La prod ne contient aucune donnée à garder : les colonnes `user_id` sont obligatoires dès leur migration, et l'inscription est ouverte dès la release.

### 1.3 Mode de travail

Je code ; tu relis et valides chaque étape. Design volontairement sommaire (« fonctionnel d'abord »).

### 1.4 Hors périmètre

- Fournisseurs externes (Google, GitHub…), passkeys / WebAuthn, Keycloak ou tout fournisseur d'identité hébergé.
- Rôles et privilèges.
- Récupération d'un compte dont on a oublié l'email **et** le mot de passe (aucune solution satisfaisante) ; adresse mail de secours ; clé de récupération.
- Refus des mots de passe courants : l'utilisateur est responsable de son mot de passe, les conseils affichés l'y invitent.
- Intégration de la console d'administration aux comptes, et toute action de la console sur les comptes.

---

## 2. Principes

- **Pas d'usine à gaz** : ce qui n'apporte ni sécurité ni usage réel attend (§13).
- **Aucun parcours perdu** : chaque mail propose un lien **et** un code ; recharger la page ou changer d'appli (boîte mail, Bitwarden) ne fait jamais perdre l'étape en cours (§6.1).
- **Le serveur décide** : l'interface reflète les règles (délai, temps restant, mot de passe trop court), le serveur les impose.
- **Données minimales**, et rien de temporaire ou de supprimé au-delà de 3 mois (§10).
- **Zéro dépendance** si c'est possible sans dette ni risque ; sinon une bibliothèque sobre pour un besoin précis, jamais un framework (§11.3).
- **Code partagé avec la console d'administration** quand les deux en ont besoin (§11.2).
- **Un seul endroit pour les réglages** (§9).
- **Conventions du repo** (`docs/architecture.md`) : specs partagées, pipeline router → controller → service → query, codes d'erreur traduits par le front, migrations Flyway rétrocompatibles, tests d'intégration sur vraie MariaDB.

---

## 3. Existant à réutiliser, écarts à corriger

### 3.1 À réutiliser

- **Console d'administration** (`apps/admin/src/server/auth/`) : `hashPassword.ts`, `verifyPassword.ts` (format sans `$`, `timingSafeEqual`), `hashPasswordCli.ts`, `sessionStore.ts` (jeton de 32 octets en `base64url`), `authRouter.ts`, `requireSession.ts`, `loginThrottle.ts`, `requireSameOrigin.ts`, `writeAuditLog`.
- **Lecture du cookie** : `readCookieValue` (`packages/common/src/universal/cookie/`).
- **Specs** : statuts `401` (`NEED_AUTHENTIFICATION`) et `403` (`FORBIDDEN`), champ `request.protected` de `EndpointModel`.
- **Même origine** : le front appelle `/api` (proxy de Vite en dev, Caddy en prod) ; pas de CORS.
- **Infra** : Cloudflare → Caddy → serveur, HTTPS et en-têtes de sécurité ; Caddy connaît l'IP réelle ; secrets dans `.env.prod` + Bitwarden.
- **Header de la homepage** : un bouton « Se connecter » existe déjà (il affiche « La connexion arrive bientôt »).
- **Pages légales** : « Mentions légales » et « Données personnelles » (`apps/client/src/projects/homepage/content/footerPages.ts`).
- **Node 24.22.1** dans l'image : `argon2id` natif (`crypto.argon2`).
- **MariaDB 11.8** : collations UCA 14 (`utf8mb4_uca1400_as_ci`, sensible aux accents, pas à la casse).

### 3.2 À corriger dans le chantier

| # | Constat | Correction |
|---|---|---|
| 1 | Pas de `trust proxy` : derrière Caddy, tous les visiteurs ont la même IP | IP réelle par un en-tête écrasé par Caddy (§7.2) |
| 2 | Pas de `429` dans `HttpStatutCodeErrorEnum` ; `ApiError` ne garde pas les en-têtes | `429` + `Retry-After` jusqu'au front |
| 3 | `scryptSync` dans la console : synchrone, paramètres faibles | `argon2id` asynchrone partagé (§6.3, §11.2) |
| 4 | Serveur limité à 256 Mo | Concurrence des hashs plafonnée (§6.3) |
| 5 | `packages/common` sans environnement Node | `src/node/` et son bloc ESLint (§11.2) |
| 6 | `POST /error-log/entries` public, jamais appelé par le front | Endpoint supprimé avec son interface dans les specs. `logError`, son service et la table `error_log` restent : le serveur y enregistre ses erreurs |
| 7 | `logError` peut stocker un corps de requête ; `error_log` sans durée | Hygiène (§7.5), purge à 90 jours |
| 8 | `apps/server/src/todo_folder/` : ancien système JWT | Supprimé |
| 9 | `protected` à `false` partout, ignoré par le serveur ; faux `Authorization: Bearer FakeToken` dans le `fetchHandler` du front | `protected` lu par le serveur (§6.11) ; faux `Bearer` supprimé |
| 10 | `AppError` sans 401, 403, 429 | Erreurs créées ; `AuthErrorCodeEnum` ajouté à `ErrorCode` |
| 11 | Collation `utf8mb4_unicode_520_ci` : casse **et** accents ignorés dans les comparaisons (`=`, `UNIQUE`, `WHERE`) | Voulu ailleurs (chercher « pokemon » trouve « Pokémon ») : aucune migration globale. Colonnes de l'auth réglées une par une (§5.3) |

Faits par le chantier de l'hébergement, avant celui-ci : CSP, `pnpm audit` et Dependabot, logs à 90 jours (job `log-retention`), restauration depuis la console et bandeau du site. Les mails (fournisseur, DNS, `contact@`) sont son [cahier des charges](../ci_cd/cahier_des_charges.md).

---

## 4. Session et cookie

### 4.1 Fonctionnement

Session opaque en base :

```
Connexion    serveur : vérifie le hash, tire 32 octets aléatoires (le jeton),
             crée une ligne auth_session avec SHA-256(jeton), pose le cookie
Requête      SHA-256(cookie) → ligne → expiration → prolonge si besoin → utilisateur
Déconnexion  ligne supprimée : le jeton ne marche plus, immédiatement
```

Jeton : 32 octets de `randomBytes` en `base64url`. En base, seulement son SHA-256 : une fuite de la base ne donne aucune session.

### 4.2 Cookie

| Attribut | Valeur |
|---|---|
| Nom | `__Host-citadel_session` ; `citadel_session` quand `Secure` est désactivé (le préfixe l'exige) |
| `HttpOnly` | oui |
| `Secure` | oui ; désactivable en dev (`AUTH_COOKIE_SECURE`) |
| `SameSite` | `Lax` : un `GET` ne modifie donc jamais rien |
| `Path` / `Domain` | `/` / absent |
| `Max-Age` | avec « se souvenir de moi » seulement |

CSRF : `SameSite=Lax`, mutations en `POST`/`PATCH`/`DELETE`, contrôle de l'en-tête `Origin` sur les requêtes non sûres.

### 4.3 Durées

- **Avec « se souvenir de moi »** : 7 jours après la dernière action. Si `last_seen_at` date de plus de 5 minutes, le serveur le met à jour, repousse `expires_at` et renvoie le cookie avec un nouveau `Max-Age`.
- **Sans** : cookie sans `Max-Age`, effacé quand le navigateur se ferme, et 12 h d'inactivité au plus côté serveur. Les navigateurs qui rouvrent les onglets au démarrage, et les navigateurs mobiles qu'on ne ferme jamais vraiment, gardent ce cookie : la limite de 12 h s'applique alors.
- **Plafond absolu** : 30 jours après la connexion, même en restant actif.
- **Transparence** : sous la case « Se souvenir de moi » (connexion **et** inscription), « Reste connecté 7 jours sans visite, 30 jours au plus » ; la liste des sessions affiche la fin de chacune.
- **Sessions expirées** : refusées à la lecture, supprimées par la purge du serveur (§6.1).

---

## 5. Données

### 5.1 Tables des projets

| Table | Changement |
|---|---|
| `gdc_game` | `user_id` obligatoire, clé étrangère `ON DELETE CASCADE` vers `auth_user` |
| `gdc_boss`, `gdc_death` | Aucun : la propriété se vérifie par jointure jusqu'à `gdc_game` ; la cascade existe déjà (V008) |
| `backlog_user_game` | `user_id` ; clé primaire `(user_id, game_id)` ; cascade |
| `backlog_user_version` | `user_id` ; unicité `(user_id, version_id, platform_id)` ; cascade |
| `backlog_done_dlc` | Aucun (cascade par sa version jouée) |
| `backlog_series` | `user_id` nullable : vide pour une série IGDB commune, rempli pour une série créée à la main (cascade) |
| Tables IGDB (`backlog_game`, `backlog_version`, `backlog_version_platform`, `backlog_dlc`, `backlog_company`, `backlog_platform`) | Aucun : données communes |
| `error_log` | Purge à 90 jours |

Un jeu du backlog ne se range que dans une série IGDB ou une série de son propriétaire.

### 5.2 Tables de l'auth

Conventions des migrations existantes (V011 et suivantes) : InnoDB, `utf8mb4`, `created_at` et `updated_at` en `DATETIME(3)`, `field` explicite dans Sequelize. Toute table liée à un utilisateur a une clé étrangère `ON DELETE CASCADE` vers `auth_user`.

**`auth_user`**

| Colonne | Type | Notes |
|---|---|---|
| `id` | INT, auto-incrément | |
| `email` | VARCHAR(254), unique | Tel que saisi ; jamais d'espace (le front bloque l'envoi, le serveur fait un `trim`) ; collation §5.3 |
| `username` | VARCHAR(64), unique | Identifiant, définitif ; collation par défaut (casse ignorée) |
| `display_name` | VARCHAR(64), nul | Pseudo affiché ; vide = `username` ; mêmes règles de format, aucune unicité |
| `password_hash` | VARCHAR(255) | Format auto-descriptif (§6.3) |
| `password_changed_at` | DATETIME(3) | |
| `login_methods` | ENUM `mail`, `password`, `both` | Défaut `both` (§6.4) |
| `last_login_at` | DATETIME(3), nul | Dernière connexion réussie |
| `last_seen_at` | DATETIME(3), nul | Dernier accès, mis à jour avec la session |
| `created_at`, `updated_at` | DATETIME(3) | |

**`auth_session`** : `id`, `user_id`, `token_hash` (BINARY(32), unique), `remember` (BOOLEAN), `user_agent` (VARCHAR(255)), `ip` (VARCHAR(45), tronquée : `/24` en IPv4, `/48` en IPv6), `last_seen_at`, `expires_at`, `absolute_expires_at`, `created_at`, `updated_at`.

**`auth_flow`** : tout parcours en plusieurs étapes (§6.1).

| Colonne | Type | Notes |
|---|---|---|
| `id` | INT | |
| `token_hash` | BINARY(32), unique | Jeton du cookie de parcours |
| `kind` | ENUM | `registration`, `login`, `mail_login`, `password_reset`, `email_change`, `email_factor` |
| `step` | ENUM | `mail_code`, `second_factor`, `new_password` |
| `user_id` | INT, nul | Vide pour une inscription |
| `email` | VARCHAR(254) | Adresse du mail |
| `payload` | JSON, nul | Inscription : `username`, `password_hash` ; changement d'email : nouvelle adresse |
| `code_hmac` | BINARY(32), nul | Empreinte HMAC du code |
| `link_token_hash` | BINARY(32), nul | SHA-256 du jeton du lien |
| `attempts`, `send_count` | INT | |
| `remember` | BOOLEAN | Appliqué à la session finale |
| `last_sent_at`, `expires_at` | DATETIME(3) | |
| `created_at`, `updated_at` | DATETIME(3) | |

**`auth_factor`** : `id`, `user_id`, `type` (ENUM `email`, `totp`), `name` (VARCHAR(50)), `secret_encrypted` (VARBINARY(255), nul), `key_version` (TINYINT, nul), `last_used_step` (BIGINT, nul), `last_used_at`, `created_at`, `updated_at`.

**`auth_recovery_code`** : `id`, `user_id`, `code_hash` (BINARY(32)), `used_at` (nul), `created_at`, `updated_at`.

**`auth_event`** : `id`, `user_id` (nul), `type`, `ip`, `user_agent`, `created_at`, `updated_at`. Purge à 90 jours.

### 5.3 Collations et types

- Empreintes en `BINARY(32)` : comparaison octet par octet.
- Email : `utf8mb4_uca1400_as_ci` sur la colonne : `Alex@…` et `alex@…` sont la même adresse, `josé@…` et `jose@…` deux adresses. Le mail part à l'adresse telle que saisie.
- Pseudo : collation par défaut : `Alex` empêche `alex`.
- Aucune migration de collation sur les tables existantes.

---

## 6. Parcours, feature par feature

### 6.1 Commun à tous les parcours

- **`auth_flow` + cookie de parcours** : tout parcours en plusieurs étapes (inscription, connexion avec 2FA, connexion par mail, mot de passe oublié, changement d'email, activation du facteur mail) a une ligne `auth_flow` et un cookie `HttpOnly` dédié, valable le temps du parcours.
- **Reprise** : une page `/auth/...` demande au serveur s'il y a un parcours en cours et se replace à la bonne étape. Les champs tapés (sauf les mots de passe) sont gardés dans le `sessionStorage` de l'onglet. Au retour sur l'onglet (`visibilitychange`), le front redemande l'état : si le lien a été ouvert dans un autre onglet du même navigateur, la page passe d'elle-même à la suite.
- **Lien et code dans chaque mail** :
  - le **code** (6 chiffres, empreinte HMAC, usage unique, invalidé par un renvoi) se colle dans la page restée ouverte, y compris sur un autre appareil ;
  - le **lien** (jeton de 32 octets, haché) ne marche que dans le navigateur qui a commencé le parcours. Ailleurs, la page dit d'utiliser le code. Sinon, un attaquant lance une connexion avec ton email, tu cliques, et c'est son navigateur qui est connecté ;
  - la page d'arrivée du lien (`/auth/verify`) demande un clic de confirmation (`POST`) : les antivirus de messagerie ouvrent les liens pour les analyser.
- **Temps restant** : chaque réponse renvoie `expiresAt` et, pendant un délai, `retryAfter`.
- **Expiration** : un parcours expiré est refusé à la lecture ; une minuterie du serveur supprime les lignes expirées (`auth_flow`, `auth_session`) toutes les 15 minutes, et les vieilles lignes de `auth_event` et `error_log` une fois par jour.
- **Réponses neutres** : rien ne dit si un email existe.

### 6.2 Inscription

1. **Formulaire** : email, pseudo, mot de passe, confirmation du mot de passe, case « Se souvenir de moi ».
   - Pseudo : 1 à 64 caractères (lettres sans accent, chiffres, espaces, `_`, `-` ; espaces de début et de fin retirés), définitif. Bouton « Vérifier la disponibilité » à côté du champ.
   - Mot de passe : barre de force sous le premier champ (§6.3) ; le second signale une différence ; une icône œil affiche ou masque les deux.
   - Messages : « Tu as 30 minutes pour terminer ton inscription, sinon il faudra recommencer. » ; « Utilise un mot de passe différent pour chaque site, idéalement avec un gestionnaire de mots de passe. » ; conditions du mot de passe qui passent au vert en direct.
   - Les champs incorrects sont coloriés à l'envoi.
2. **Serveur** : pseudo pris → `409` `USERNAME_TAKEN`. Sinon, création d'un `auth_flow` `registration` ; réponse toujours « un email t'a été envoyé ».
3. **Mail** :
   - adresse nouvelle : « Confirme ton inscription » + lien + code ;
   - adresse déjà inscrite : « Tu as déjà un compte sur ce site, dernière connexion il y a 3 semaines » + lien vers la connexion, sans code. Durée floue : « aujourd'hui », puis 1 à 7 jours, 1 à 5 semaines, 1 à 12 mois, puis en années.
4. **Code ou lien validé** : création de `auth_user` (pseudo revérifié), suppression du parcours, session ouverte.
5. **Étape facultative** : « Protège ton compte avec une application d'authentification » (§6.7), puis retour à la page demandée au départ.

Une nouvelle inscription avec la même adresse remplace le parcours en attente : la personne qui reçoit les mails gagne toujours.

### 6.3 Mots de passe

- **Règles** (specs, partagées avec le front) : 12 à 128 caractères, aucune règle de composition.
- **Barre de force** : petite fonction testée, sans bibliothèque : longueur, variété des caractères, répétitions (`aaaa`), suites (`1234`, `abcd`), rangées de clavier (`azerty`, `qwerty`). Indicative, elle ne bloque rien. Un « ? » à côté explique sa limite : elle surestime un mot du dictionnaire maquillé (`P@ssw0rd!`).
- **Jamais le même** : changer son mot de passe (profil ou mot de passe oublié) pour le mot de passe actuel est refusé (`400` `PASSWORD_UNCHANGED`).
- **Hash** : `argon2id` natif, asynchrone, minimum OWASP (19 Mio, 2 passes, parallélisme 1) ; 2 hashs simultanés au plus, les autres attendent.
- **Format auto-descriptif** : algorithme et paramètres dans la chaîne stockée, séparés par `:`, sans `$` (la console garde son hash dans `.env.prod`). Si les paramètres montent, chaque mot de passe est refait à la connexion suivante de son propriétaire (c'est le seul moment où le serveur le connaît) ; les anciens hashs restent valables d'ici là.
- **Comparaison à temps constant** ; **hash factice** pour un identifiant inconnu (même délai qu'un mauvais mot de passe).

### 6.4 Connexion

- **Page** : identifiant (email ou pseudo ; un pseudo ne contient jamais `@`), mot de passe, case « Se souvenir de moi », lien « Recevoir un lien de connexion par mail » et lien « Mot de passe oublié ».
- **Par mot de passe** : sans 2FA, session immédiate. Avec 2FA, `auth_flow` `login` à l'étape `second_factor` : l'utilisateur choisit un TOTP, un code reçu par mail ou un code de secours. Aucune session avant la fin.
- **Par mail** : email ou pseudo → mail (lien + code) → TOTP s'il existe (le mail remplace le mot de passe, jamais le TOTP).
- **Méthodes** : choisies dans le profil, « Je préfère pouvoir me connecter : Par mail / Par mon pseudo (et mot de passe) / Les deux » (défaut : les deux). Une méthode fermée répond comme un échec ordinaire : `401` `INVALID_CREDENTIALS` pour le mot de passe, réponse neutre sans mail pour le lien.
- **Échec** : même message pour un identifiant inconnu et un mauvais mot de passe.
- **Déjà connecté** : la page de connexion redirige vers le profil ou la page demandée ; une nouvelle connexion dans le même navigateur supprime l'ancienne session.
- `last_login_at` à chaque connexion ; `last_seen_at` avec la session.

### 6.5 Mot de passe oublié

Email ou pseudo → réponse neutre → mail (lien + code) à l'adresse du compte, jamais affichée → TOTP ou code de secours s'il existe (comme GitHub, et comme le recommande OWASP : sinon, une boîte mail compromise suffit à contourner la 2FA) → nouveau mot de passe, deux fois, différent de l'actuel → toutes les sessions supprimées → connecté.

### 6.6 Profil

Page `/auth/profile` :

- **Identité** : pseudo (définitif), pseudo affiché (modifiable, vide = pseudo), email.
- **Email** : mot de passe, puis lien + code à la **nouvelle** adresse ; remplacement après validation ; notification à l'ancienne.
- **Mot de passe** : ancien + nouveau deux fois, différent de l'ancien ; toutes les autres sessions supprimées.
- **Sécurité** : facteurs de 2FA, codes de secours, méthodes de connexion (§6.4).
- **Sessions actives** (§6.8).
- **Mes données** : export, suppression des données d'un projet (une case par projet), suppression du compte (§6.9).
- **Actions sensibles** (mot de passe, email, suppression d'un facteur, suppression de données ou du compte) : mot de passe redemandé, et second facteur pour supprimer le compte.

### 6.7 Double authentification

- **Par mail** : un code (+ lien) après le mot de passe. Activation confirmée par un premier code.
- **TOTP** : secret généré par le serveur ; QR code (`otpauth://`, émetteur « Citadel », email en libellé) généré **dans le navigateur**, plus la clé à saisir à la main. L'utilisateur nomme chaque facteur et peut en avoir plusieurs ; activation après un premier code valide. SHA-1, 6 chiffres, 30 s, ±1 pas. Anti-rejeu : un code accepté ne peut pas resservir, même pendant ses 30 à 90 secondes de validité. Secret chiffré en AES-256-GCM, avec la version de la clé.
- **Codes de secours** : la roue de secours du second facteur (téléphone perdu, boîte mail inaccessible). Générés à l'activation du premier facteur, quel que soit son type ; 10 codes à usage unique de 10 caractères (groupes de 5), hachés. Affichés une seule fois : « Sauvegarde-les en lieu sûr : tu ne pourras plus jamais les revoir ici. », avec téléchargement en texte. Régénérables avec le mot de passe, ce qui invalide les anciens ; le profil affiche le nombre restant.
- **Gestion** : liste (nom, type, création, dernier usage), ajout, suppression confirmée par le mot de passe. Supprimer le dernier facteur désactive la 2FA et supprime les codes de secours.

### 6.8 Sessions actives et déconnexion

- Liste : navigateur et système (déduits du user agent), dernière activité, création, fin prévue, IP tronquée, « cette session ». Actions : déconnecter une session, « tout déconnecter », « tout déconnecter sauf ici ».
- **Déconnexion** : sans confirmation ; avertissement seulement s'il reste des mutations en cours ou un formulaire modifié (`useBlocker`, comme `useProjectChangeTransition`).
- Le cache de TanStack Query est vidé à la déconnexion (`queryClient.clear()`).
- Dans les autres onglets, le prochain appel reçoit un `401` et renvoie vers `/auth/login`.

### 6.9 Suppression et export

- **Suppression du compte** : mot de passe (+ second facteur), puis un écran : « La suppression est immédiate et définitive. Aucun délai de récupération. » Tout part par cascade ; mail de confirmation. Les sauvegardes l'oublient en 3 mois au plus (§10).
- **Suppression des données d'un projet** : une case par projet, mot de passe ; le compte reste.
- **Export** : « Télécharger mes données » → un ZIP avec un CSV par table, toutes les lignes de l'utilisateur, sans aucun secret (ni hash, ni empreinte, ni secret TOTP). ZIP sans compression, fait sans bibliothèque.

### 6.10 Où se connecter dans l'interface

- **Homepage** : le bouton « Se connecter » du header mène à `/auth/login`. Connecté : icône utilisateur + pseudo affiché (vers le profil), et bouton « Se déconnecter » à côté.
- **Backlog et Game Death Counter** : une petite icône de profil dans leur interface.
- Le projet `auth` n'apparaît ni dans la roue ni dans le pied de page.

### 6.11 Protection des endpoints et des projets

- `protected` (specs) est lu par le routeur typé du serveur : `true` → session exigée (`401` sinon, ajouté tout seul aux erreurs possibles de l'endpoint), et le contrôleur reçoit l'identifiant de l'utilisateur.
- Chaque service et chaque requête sur une table d'utilisateur filtre par `user_id`. La ressource d'un autre utilisateur répond `404`. `user_id` vient toujours de la session, jamais du corps.
- **Accès des projets** (`ProjectDictionary`) : Homepage, Satisfactory et Angers Irigo publics ; Game Death Counter et Backlog privés. Un projet privé renvoie un visiteur non connecté vers `/auth/login?redirect=…`, puis le ramène.
- **État connecté** : `useQuery` sur `GET /auth/me` (clé `["auth", "me"]`, `staleTime` de 30 s). Son `401` veut dire « pas connecté ». Un `401` sur toute autre requête vide le cache et redirige vers la connexion (`onError` des caches de requêtes et de mutations).
- Erreurs : `authErrorReasons` et `checkInput` avec les schémas zod partagés.

### 6.12 Endpoints

Préfixe `/auth` (`ApiPrefixEnum`). Liste à figer dans la roadmap :

| Endpoint | Rôle |
|---|---|
| `GET /auth/usernames/:username/availability` | Disponibilité d'un pseudo (limité par IP) |
| `POST /auth/registrations` | Commence une inscription |
| `POST /auth/login/password`, `POST /auth/login/mail` | Connexion |
| `POST /auth/password-resets` | Mot de passe oublié |
| `GET /auth/flow`, `DELETE /auth/flow` | État du parcours, abandon |
| `POST /auth/flow/code`, `/link`, `/second-factor`, `/new-password`, `/resend` | Étapes d'un parcours |
| `POST /auth/logout` | `204`, idempotent |
| `GET /auth/me`, `PATCH /auth/me` | Qui suis-je ; pseudo affiché, méthodes de connexion |
| `POST /auth/me/password`, `POST /auth/me/email` | Mot de passe ; changement d'email |
| `GET /auth/sessions`, `DELETE /auth/sessions/:id`, `DELETE /auth/sessions` | Sessions |
| `GET /auth/factors`, `POST /auth/factors/totp`, `POST /auth/factors/totp/confirm`, `POST /auth/factors/email`, `DELETE /auth/factors/:id` | 2FA |
| `POST /auth/recovery-codes` | Régénérer les codes de secours |
| `GET /auth/me/export`, `DELETE /auth/me/projects/:project`, `DELETE /auth/me` | Export, suppressions |

Erreurs nouvelles : `401` (`AUTHENTICATION_REQUIRED`, `INVALID_CREDENTIALS`), `403` (`REGISTRATION_CLOSED`), `400` (`PASSWORD_UNCHANGED`, `INVALID_CODE`, `FLOW_EXPIRED`…), `409` (`USERNAME_TAKEN`), `429` (`TOO_MANY_ATTEMPTS` + `Retry-After`).

---

## 7. Anti-abus et sécurité transverse

### 7.1 Menaces et parades

| Menace | Parade |
|---|---|
| Brute force sur un compte | 2 s entre deux essais, bannissement temporaire après 15 échecs (§7.3) |
| Un mot de passe essayé sur beaucoup de comptes | Compteur par IP, puis bannissement temporaire |
| Verrouillage malveillant d'un compte | Le bannissement vise le couple compte + IP : un inconnu ne bloque pas ton compte |
| Énumération des comptes | Réponses et délais identiques, hash factice, inscription et mot de passe oublié neutres. Les pseudos, eux, sont publics par nature |
| Spam d'inscriptions | Limite par IP, parcours purgés, champ piège caché (honeypot) |
| Spam d'envoi de mails | Délai de renvoi, limites par adresse et par IP (sinon la réputation du domaine d'envoi est ruinée) |
| Rejeu d'un code ou d'un lien | Usage unique, durée courte, essais limités, lien lié au navigateur |
| Vol de session | Cookie `HttpOnly`/`Secure`, CSP, sessions révocables |
| CSRF | `SameSite=Lax`, `Origin`, `GET` sans effet |

Les limiteurs visent le compte trouvé, pas le texte tapé : alterner email et pseudo ne double pas les essais.

### 7.2 IP réelle

Caddy ne croit déjà `CF-Connecting-IP` que venant de Cloudflare (`trusted_proxies cloudflare`). Il **écrase** en plus un en-tête dédié avec l'IP validée (`header_up X-Real-IP {client_ip}` dans `handle_path /api/*`) ; le serveur, joignable seulement par Caddy, ne lit que cet en-tête. Vérifié en `prod:local` (Caddy → serveur), puis une fois en prod (Cloudflare → Caddy). En IPv6, le bannissement vise le `/64`.

### 7.3 Délai et bannissement

- Succès : immédiat, compteur remis à zéro. Échec : `401`, puis aucun nouvel essai sur ce compte avant 2 s. Après 15 échecs depuis la même IP sur le même compte : 15 minutes de `429` pour ce couple. Compteur remis à zéro après un succès ou 15 minutes de calme. Pendant un délai : `429` + `Retry-After` ; bouton désactivé avec compte à rebours.
- Bannissement d'IP : 20 échecs en 10 minutes ou plus de 3 inscriptions par heure → 15 minutes de `429`.
- Compteurs en mémoire (une seule instance) : remis à zéro à chaque déploiement.

### 7.4 Détection basique

`auth_event` : échecs, inscriptions, parcours jamais confirmés, connexions, ajouts et suppressions de 2FA, changements de mot de passe ou d'email. Réponses proportionnées : bannissement temporaire, journal, notifications par mail. Pas de blocage définitif automatique.

### 7.5 Hygiène des journaux

Jamais de mot de passe, jeton, code, lien ni secret TOTP dans un log, un message d'erreur ou `error_log` ; aucune requête d'auth loguée avec son corps.

---

## 8. Mail

### 8.1 Envoi

- **Fournisseur, adresse `noreply`, DNS, expéditeur réel, en mémoire ou « journal »** : construits avant ce chantier, pour le formulaire de contact ([cahier de l'hébergement](../ci_cd/cahier_des_charges.md), §2, §5 et §6). Ce chantier n'y ajoute que ses gabarits (§8.3).

### 8.2 Réception : `contact@`

Mise en place avant ce chantier ([cahier de l'hébergement](../ci_cd/cahier_des_charges.md), §3).

### 8.3 Mails

HTML et texte brut, en français, gabarit minimal : code en gros, lien, durée de validité, « si tu n'es pas à l'origine de cette demande, ignore ce mail ». Le thème viendra plus tard (`docs/TODO.md`).

| Mail | Contenu |
|---|---|
| Inscription, adresse nouvelle | Lien + code |
| Inscription, adresse déjà inscrite | « Tu as déjà un compte, dernière connexion il y a… », lien vers la connexion |
| Mot de passe oublié | Lien + code |
| Connexion par mail | Lien + code |
| Second facteur par mail, activation du facteur mail | Code + lien |
| Changement d'email | Lien + code à la nouvelle adresse ; notification à l'ancienne |
| Notifications | Mot de passe changé, email changé, 2FA ajoutée ou retirée, compte supprimé |

---

## 9. Réglages et configuration

### 9.1 Un seul endroit

Toutes les durées et tous les seuils sont des variables d'environnement, déclarées une seule fois dans la section `auth` de `env.ts` (zod), avec leur valeur par défaut. Le code n'y accède que par `authSettings`. `.env.example` les liste toutes avec leur valeur (rien de sensible) ; `.env.test` raccourcit les durées utiles aux tests. Le front ne les connaît pas : le serveur lui renvoie `expiresAt` et `retryAfter`.

Les règles de format (longueurs du mot de passe, de l'email, du pseudo, du code) vivent dans les schémas zod de `packages/specs`.

### 9.2 Variables

| Variable | Valeur |
|---|---|
| `AUTH_SESSION_REMEMBER_DAYS` | 7 |
| `AUTH_SESSION_IDLE_HOURS` | 12 |
| `AUTH_SESSION_ABSOLUTE_DAYS` | 30 |
| `AUTH_SESSION_TOUCH_MINUTES` | 5 |
| `AUTH_COOKIE_SECURE` | `true` (`false` en dev) |
| `AUTH_REGISTRATION_ENABLED` | `true` (interrupteur d'urgence) |
| `AUTH_REGISTRATION_MINUTES` | 30 |
| `AUTH_PASSWORD_RESET_MINUTES` | 15 |
| `AUTH_MAIL_LOGIN_MINUTES` | 15 |
| `AUTH_EMAIL_CHANGE_MINUTES` | 30 |
| `AUTH_SECOND_FACTOR_MINUTES` | 10 |
| `AUTH_CODE_MAX_ATTEMPTS` | 5 |
| `AUTH_MAIL_RESEND_SECONDS` | 60 |
| `AUTH_MAILS_PER_ADDRESS_PER_HOUR` | 5 |
| `AUTH_MAILS_PER_IP_PER_HOUR` | 20 |
| `AUTH_FAILURE_DELAY_SECONDS` | 2 |
| `AUTH_ACCOUNT_FAILURES_BEFORE_BAN` | 15 |
| `AUTH_ACCOUNT_BAN_MINUTES` | 15 |
| `AUTH_FAILURE_RESET_MINUTES` | 15 |
| `AUTH_IP_FAILURES_BEFORE_BAN` | 20 |
| `AUTH_IP_FAILURE_WINDOW_MINUTES` | 10 |
| `AUTH_IP_BAN_MINUTES` | 15 |
| `AUTH_REGISTRATIONS_PER_IP_PER_HOUR` | 3 |
| `AUTH_ARGON2_MEMORY_KIB`, `AUTH_ARGON2_PASSES`, `AUTH_ARGON2_PARALLELISM` | 19456, 2, 1 |
| `AUTH_HASH_CONCURRENCY` | 2 |
| `AUTH_TOTP_ISSUER` | `Citadel` |
| `AUTH_TOTP_DRIFT_STEPS` | 1 |
| `AUTH_RECOVERY_CODES_COUNT` | 10 |
| `AUTH_EVENT_RETENTION_DAYS`, `ERROR_LOG_RETENTION_DAYS` | 90 |
| `AUTH_PURGE_INTERVAL_MINUTES` | 15 |

### 9.3 Secrets (`.env.prod` + Bitwarden, créés avant d'être écrits)

`AUTH_CODE_HMAC_KEY` ; `AUTH_TOTP_ENCRYPTION_KEY` et sa version. Valeurs quelconques dans `.env.test`. La clé du fournisseur de mails existe déjà (cahier de l'hébergement). Chaque variable va dans `.env.example` (bonne section, `[secret]` devant chaque secret) et dans `infra/compose.yml` (`site-prod-server`).

---

## 10. RGPD

Je ne suis pas juriste : points à connaître, pas un avis juridique. Objectif : être parfaitement conforme.

### 10.1 La règle des 3 mois

Aucune donnée personnelle temporaire ou supprimée ne survit plus de **3 mois**, où qu'elle soit (base, journaux, sauvegardes). C'est la limite absolue. Le reste vit tant que le compte existe.

### 10.2 Inventaire

| Donnée | Durée |
|---|---|
| Email, pseudo, pseudo affiché, hash du mot de passe, dates de connexion, facteurs 2FA, codes de secours | Tant que le compte existe |
| Sessions (empreinte, user agent, IP tronquée, dates) | 30 jours au plus, puis purge |
| Parcours (`auth_flow`) | Quelques minutes, puis purge |
| `auth_event`, `error_log` | 90 jours |
| Logs de Caddy et des conteneurs | 90 jours (job `log-retention` d'`infra/citadel`) |
| Sauvegardes de la base | Moins de 10 semaines (rétention dans `infra/citadel`) |
| Journal des comptes supprimés (identifiant, date) | 90 jours |
| Données des projets | Tant que le compte existe |

Les fichiers dérivés (historiques déposés pour la console) suivent la même règle.

### 10.3 Principes

Minimisation (ni nom ni prénom) ; suppression réelle (§6.9) ; accès et portabilité par l'export ; aucun traceur au-delà du strictement nécessaire.

### 10.4 Cookies et stockage du navigateur

Les lignes directrices de la CNIL (délibération n° 2020-091) dispensent de consentement les traceurs strictement nécessaires à un service demandé par l'utilisateur, dont l'authentification et sa sécurité, et la personnalisation d'interface qu'il a choisie. Ce que le site dépose :

| Traceur | Rôle |
|---|---|
| Cookie de session | Authentification (persistant seulement si « se souvenir de moi » est coché) |
| Cookie de parcours | Étape en cours d'une inscription, d'une connexion, etc. |
| `localStorage` : thème clair ou sombre, favoris et réglages d'Angers Irigo, colonnes du Backlog, bandeau du site fermé | Choix d'interface de l'utilisateur |
| `sessionStorage` : champs d'un parcours en cours ; intro déjà vue | Reprise après rechargement ; intro jouée une fois par session |

Tous dispensés de bandeau, à condition d'être décrits dans « Données personnelles ». Une étape de la roadmap vérifie ce point sur le site de la CNIL avant la release, ainsi que l'absence de cookie ajouté par Cloudflare hors sécurité [nous].

### 10.5 Sauvegardes et restauration

- **Rétention** (`infra/citadel`) : base, chaque jour : 14 jours + 4 dimanches + 2 premiers dimanches du mois ; dumps « avant déploiement » : les 2 derniers, 30 jours au plus. La plus vieille a moins de 10 semaines.
- **Restauration** (`citadel restore-db` ou la zone de danger de la console). Ce chantier y ajoute la commande « après restauration » du serveur, lancée avec la date de la sauvegarde :
  - **rejouer les suppressions** : les comptes supprimés après la date de la sauvegarde sont supprimés de nouveau, d'après un journal en lignes JSON (identifiant, date) tenu dans un volume du serveur, hors de la base (sinon il serait restauré avec elle), purgé à 90 jours ;
  - **vider toutes les sessions et tous les parcours** : sinon, une session révoquée après la sauvegarde redevient valide.
- **Bandeau** : le message automatique de restauration gagne la phrase « Si tu as changé de mot de passe ou d'email pendant cette période, refais-le. »

### 10.6 Pages légales

- « Données personnelles » : données des comptes, finalités, durées (§10.2) et règle des 3 mois, IP tronquées dans les sessions, sauvegardes, droits (export et suppression en libre-service, plus `contact@`), cookies et stockage (§10.4).
- Pas de conditions d'utilisation pour l'instant.

---

## 11. Organisation du code

### 11.1 Auth, un projet comme les autres

| Couche | Emplacement | Contenu |
|---|---|---|
| Specs | `packages/specs/src/projects/auth/` | Registre d'endpoints, `endpoint/<ressource>/<action>/`, `error/authErrorCode.enum.ts`, règles de format |
| Specs communes | `packages/specs/src/specUtils/` | `ApiPrefixEnum.AUTH`, `429`, `protected` lu par le serveur |
| Serveur | `apps/server/src/projects/auth/` | `router.ts`, `controller/`, `service/`, `query/`, `models/`, `bean/`, `mapper/`, `integrationTest/` |
| Serveur, transverse | `middleware/`, `error/`, `configuration/env.ts` | `requireSession`, IP réelle, `Origin` ; erreurs 401, 403, 429 ; section `auth` |
| Migrations | `apps/server/src/sql/migrations/V011__…` et suivantes | Tables `auth_*`, `user_id` des projets |
| Front | `apps/client/src/projects/auth/` | `/auth/login`, `/auth/register`, `/auth/forgot-password`, `/auth/verify`, `/auth/profile` ; `useMe` ; `authErrorReasons.ts`, `authFieldLabels.ts` |
| Front, transverse | `react/appNavigation/`, homepage, Backlog, GDC | `ProjectsEnum.Auth` (thème de la homepage, `showcase: null`), accès de chaque projet, gestion du `401`, bouton du header, icône de profil ; plus de faux `Bearer` |

### 11.2 Code Node partagé : `packages/common/src/node/`

Bloc ESLint d'environnement pour `src/node/**` (`packages/eslint-config/eslintConfigCommon.js`), interdit aux dossiers du navigateur. Contenu : hash et vérification de mot de passe, comparaison à temps constant, jeton aléatoire, empreintes. Ce qui ne sert qu'au serveur (TOTP, chiffrement, parcours) reste dans le serveur. La console passe au même `argon2id` : `ADMIN_PASSWORD_HASH` à régénérer (`citadel admin-password`).

### 11.3 Bibliothèques

- **Natif** : `crypto.argon2`, `randomBytes`, `randomInt`, `createHash`, `createHmac`, `timingSafeEqual`, `createCipheriv` (AES-256-GCM) ; TOTP (RFC 6238, testé avec ses vecteurs officiels) et Base32 écrits à la main ; `readCookieValue` + `response.cookie` ; `fetch` vers le fournisseur de mails ; CSV et ZIP sans compression (`zlib.crc32`).
- **Une bibliothèque** : QR code côté front, petite et sans dépendance. `nodemailer` seulement si le fournisseur n'a pas d'API HTTP.

---

## 12. Ordre de construction et critères de fin

### 12.1 Ordre

Après les mails du cahier de l'hébergement, sur une branche dédiée :

1. **Prérequis** : `packages/common/src/node` ; erreur 401 (IP réelle, `403`, `429` et `Retry-After` jusqu'à `ApiError` faits avec le formulaire de contact) ; suppression de `POST /error-log/entries` et de `todo_folder`.
2. **Base** : tables `auth_*` ; `user_id` et cascades des projets.
3. **Socle serveur** : `authSettings`, hash, sessions, `requireSession` piloté par `protected`, filtrage par `user_id` dans tous les services de GDC et du Backlog (avec leurs tests), purges, `auth_event`, limiteurs.
4. **Mail** : fournisseur, DNS, expéditeur réel et simulé, gabarits minimaux.
5. **Parcours** : `auth_flow`, inscription, connexion (mot de passe, mail), déconnexion, `me`, mot de passe oublié.
6. **2FA** : TOTP, mail, codes de secours.
7. **Profil** : identité, mot de passe, email, sessions, export, suppressions.
8. **Front** : projet `auth`, accès des projets, gestion du `401`, header de la homepage, icônes de profil, avertissement de déconnexion. (En pratique, chaque parcours se fait serveur puis front.)
9. **RGPD** : pages légales, commande après restauration et phrase du bandeau, vérification CNIL.
10. **Recette et release** : critères §12.2 en `prod:local`, fusion de la branche, `pnpm release`.

### 12.2 Critères de fin

Tests d'intégration sur la vraie MariaDB de test (expirations comprises : dates calculées par Node, jamais par `NOW()` en SQL, et horloge avancée par Vitest), plus un passage manuel en `pnpm prod:local` :

1. Inscription : aucune ligne `auth_user` avant confirmation ; lien et code marchent ; une adresse déjà inscrite reçoit le bon mail ; écran identique dans les deux cas ; parcours refusé puis purgé après le délai ; disponibilité du pseudo exacte.
2. Connexion : identifiant inconnu et mauvais mot de passe donnent le même `401`, le même message, des délais comparables ; 2FA exigée quand elle existe ; la connexion par mail ne contourne pas le TOTP.
3. Délai et bannissement : `429` + `Retry-After` ; 2 s entre deux essais ; couple compte + IP banni après 15 échecs, compte toujours ouvert depuis une autre IP ; mot de passe correct de nouveau accepté après l'attente ; compteur par IP ; `/64` en IPv6.
4. Parcours : un rechargement reprend à la bonne étape ; un lien ouvert dans un autre navigateur est refusé ; la page d'arrivée exige un clic ; un code ne sert qu'une fois.
5. Cookie en `prod:local` : `HttpOnly`, `Secure`, `SameSite=Lax`, `Path=/`, pas de `Domain`, préfixe `__Host-`.
6. Aucun mot de passe, jeton, code ni secret en clair en base, dans les logs ou dans `error_log`.
7. `GET /auth/me` : `200` avec une session valide ; `401` sans cookie, avec un jeton altéré ou une session expirée.
8. Expiration glissante, plafond absolu, déconnexion, « tout déconnecter sauf ici ».
9. Mot de passe : même mot de passe refusé ; changement et réinitialisation suppriment les autres sessions.
10. Isolation : jamais d'accès aux données d'un autre (`404`) ; tous les endpoints `protected` renvoient `401` sans session.
11. Suppression du compte et des données d'un projet : plus aucune ligne concernée. Export : toutes les lignes, aucun secret.
12. IP réelle : celle du client.
13. Mails en boîte de réception chez Gmail et Outlook.
14. Restauration en `prod:local` : suppressions rejouées, sessions vidées, bandeau affiché avec sa phrase.
15. `pnpm validate-all` passe (types, lint, tests, builds, audit).

---

## 13. Après l'authentification

Hors de la définition de « fini » :

- **Console, en lecture seule** : comptes (métadonnées, jamais un secret), IP bannies, événements de sécurité ; compte MariaDB limité ou API interne, jamais depuis Internet. Les compteurs de bannissement passeraient alors en base.
- **Turnstile et limitation de débit de Cloudflare, CrowdSec** : si des abus apparaissent.
- **Complétion de profil** : `missingFields` dans `GET /auth/me` quand un champ obligatoire s'ajoutera ; `terms_accepted_version` si des conditions d'utilisation arrivent.
- **File d'envoi des mails** en base, si l'envoi pendant la requête pose problème.
- **Notification « nouvelle connexion »**.
- **Remontée des plantages du front**, protégée par session et limitée par IP, si le besoin apparaît.
- Dans `docs/TODO.md` : thème des mails ; `pnpm audit` et `pnpm outdated` dans la console.

---

## 14. Risques

| Risque | Parade |
|---|---|
| Beaucoup de code d'un coup | Ordre logique, chaque étape relue et testée, recette en `prod:local`, branche dédiée |
| IP partagée derrière Caddy | En-tête écrasé par Caddy, lu seul par le serveur, testé de bout en bout |
| Mémoire du serveur | 2 hashs simultanés au plus |
| Mails en indésirables | Fournisseur, SPF, DKIM, DMARC, tests Gmail et Outlook |
| Spam d'envoi de mails | Limites par adresse et par IP |
| Lien de connexion détourné | Lien lié au navigateur, clic de confirmation |
| Données personnelles dans les logs | Hygiène, purges |
| Restauration qui ressuscite comptes ou sessions | Rejeu des suppressions, sessions vidées, bandeau |
| Calibrage des valeurs | Variables d'environnement, ajustables sans release |

---

## 15. Roadmap

Chaque étape [moi] est un commit relisible, avec ses tests ; `pnpm validate-all` passe à chaque commit. « Vérif » dit ce qui prouve que l'étape est finie, en plus des tests.

**Phase 0 — Départ**

1. [nous] Mails de l'hébergement en place ; branche `feat/auth` depuis `main` à jour. Vérif : `pnpm validate-all`.
2. [moi] Relecture du cahier contre le code du moment (écarts du §3.2, hook de `citadel restore-db`, bandeau) ; corrections du cahier si besoin, relues par toi.

**Phase 1 — Nettoyage et socle transverse**

3. [moi] Suppression de `apps/server/src/todo_folder/`.
4. [moi] Suppression de `POST /error-log/entries` (endpoint, specs, tests) ; `logError` et `error_log` restent.
5. [moi] `logError` n'enregistre jamais de corps de requête (§7.5).
6. [moi] Front : faux `Authorization: Bearer` retiré du `fetchHandler`.
7. [moi] Serveur : erreur 401 dans `AppError` et `globalErrorHandler` (`ForbiddenError` et `TooManyRequestsError` existent déjà).
8. [moi] `packages/common/src/node/` et son bloc ESLint. Vérif : un import depuis le front échoue au lint.
9. [moi] `common/node` : jeton aléatoire, SHA-256, HMAC, comparaison à temps constant.
10. [moi] `common/node` : hash `argon2id` au format auto-descriptif, vérification, détection « à refaire », 2 hashs simultanés au plus.
11. [moi] Console sur le même `argon2id` (`pnpm admin:password`, `citadel admin-password`). Vérif : connexion à la console en `prod:local` avec un nouveau hash.
12. [moi] IP réelle, déjà lue par le serveur (formulaire de contact) : regroupement `/64` en IPv6. Vérif : deux IPv6 du même `/64` comptées ensemble, en tests.
13. [moi] Contrôle de l'en-tête `Origin` sur les requêtes non sûres.
14. [moi] Section `auth` de `env.ts`, `authSettings`, `.env.example`, `.env.test` (durées courtes, secrets de test) ; outil de test pour avancer l'horloge.
15. [moi] Chiffrement AES-256-GCM avec version de clé.

**Phase 2 — Base de données**

16. [moi] Migration `auth_user`, collation de l'email. Vérif : `Alex@` et `alex@` refusés ensemble, `josé@` et `jose@` acceptés.
17. [moi] Migrations `auth_session` et `auth_flow`.
18. [moi] Migrations `auth_factor`, `auth_recovery_code`, `auth_event`.
19. [moi] Modèles Sequelize des tables `auth_*`.
20. [moi] Migration `user_id` de `gdc_game` (lignes existantes supprimées : rien à garder, §1.2) ; données de test GDC rattachées à un utilisateur.
21. [moi] Migration `user_id` du Backlog (`backlog_user_game`, `backlog_user_version`, `backlog_series`) ; données de test rattachées.

**Phase 3 — Socle serveur**

22. [moi] Projet `auth` : `ApiPrefixEnum.AUTH`, registre d'endpoints, `router.ts`, `AuthErrorCodeEnum`, `authErrorReasons` côté front.
23. [moi] Service des sessions : création, lecture avec les trois expirations, prolongation toutes les 5 minutes, suppression.
24. [moi] Cookie de session : nom, attributs, `Max-Age` selon « se souvenir de moi ».
25. [moi] `protected` lu par le routeur typé : session exigée, `401` ajouté aux erreurs de l'endpoint, identifiant de l'utilisateur passé au contrôleur.
26. [moi] `GET /auth/me` et `POST /auth/logout`. Vérif : critère 7.
27. [moi] GDC, jeux : endpoints `protected`, filtrage par `user_id`, `404` chez un autre.
28. [moi] GDC, boss et morts : propriété par jointure jusqu'à `gdc_game`.
29. [moi] Backlog, jeux suivis et versions : `protected`, filtrage par `user_id`.
30. [moi] Backlog, séries manuelles et DLC par utilisateur ; un jeu ne se range que dans une série IGDB ou une des siennes. Vérif : critère 10 sur GDC et Backlog.
31. [moi] Purges : parcours et sessions toutes les 15 minutes, `auth_event` et `error_log` à 90 jours chaque jour.
32. [moi] Écriture des `auth_event` (§7.4).
33. [moi] Limiteurs en mémoire : 2 s par compte, couple compte + IP banni après 15 échecs, bannissement d'IP, limites d'inscriptions et de mails. Vérif : critère 3 en tests.

**Phase 4 — Mail**

34. [moi] Gabarits minimaux de tous les mails (§8.3), chacun avec sa story dans le Storybook du design system (`src/mailPreview`, cahier de l'hébergement §6), durée floue de la dernière connexion.
35. [nous] Chaque gabarit envoyé depuis le dev vers Gmail et Outlook. Vérif : critère 13.

**Phase 5 — Parcours**

36. [moi] Service `auth_flow` : création, cookie de parcours, code HMAC, lien haché, essais, renvoi, expiration ; `GET` et `DELETE /auth/flow`, `POST /auth/flow/resend`.
37. [moi] `POST /auth/flow/code` et `/link`, lien lié au navigateur.
38. [moi] Règles de format dans les specs (pseudo, email, mot de passe, code) ; `GET /auth/usernames/:username/availability`.
39. [moi] Serveur, inscription : honeypot, interrupteur (fermée aussi par le quota de mails du site, voir le cahier de l'hébergement), limites, réponse neutre, deux mails, remplacement d'un parcours en attente, création du compte et de la session. Vérif : critère 1.
40. [moi] Front : projet `auth` (`ProjectsEnum.Auth`, routes, thème de la homepage), `useMe`, gestion du `401`, accès des projets avec retour à la page demandée.
41. [moi] Front, composants : champ mot de passe avec œil, barre de force et son « ? », champ code, temps restant, compte à rebours.
42. [moi] Front : reprise des parcours (`GET /auth/flow` au chargement et au retour sur l'onglet, `sessionStorage`).
43. [moi] Page d'inscription.
44. [moi] Étape « code ou lien » commune et page `/auth/verify`. Vérif : critère 4.
45. [moi] Serveur, connexion par mot de passe : hash factice, délais, rehash, méthodes fermées, `last_login_at`, passage au second facteur s'il existe.
46. [moi] Serveur, connexion par mail.
47. [moi] Page de connexion (mot de passe, lien par mail), déjà connecté redirigé. Vérif : critère 2 sans 2FA.
48. [moi] Serveur, mot de passe oublié : parcours, `/flow/new-password`, même mot de passe refusé, sessions supprimées, notification.
49. [moi] Page « mot de passe oublié ».

**Phase 6 — Double authentification**

50. [moi] TOTP et Base32 écrits à la main. Vérif : vecteurs officiels de la RFC 6238, dérive de ±1 pas, anti-rejeu.
51. [moi] Facteur TOTP : `POST /auth/factors/totp` et `/confirm`, secret chiffré.
52. [moi] Facteur mail : `POST /auth/factors/email` (parcours `email_factor`).
53. [moi] Codes de secours : création au premier facteur, usage unique, `POST /auth/recovery-codes`.
54. [moi] `/flow/second-factor` (TOTP, code par mail, code de secours) dans la connexion et le mot de passe oublié ; `GET` et `DELETE /auth/factors` ; notifications.
55. [moi] Front : étape « second facteur » de la connexion et du mot de passe oublié. Vérif : critère 2 avec 2FA, la connexion par mail ne contourne pas le TOTP.

**Phase 7 — Profil**

56. [moi] Serveur : `PATCH /auth/me` (pseudo affiché, méthodes de connexion).
57. [moi] Page de profil : structure, identité, méthodes de connexion.
58. [moi] Serveur : `POST /auth/me/password`.
59. [moi] Serveur : `POST /auth/me/email` (parcours `email_change`, notification à l'ancienne adresse).
60. [moi] Profil : mot de passe et email. Vérif : critère 9.
61. [moi] Profil : 2FA (QR code dans le navigateur, bibliothèque choisie ici), codes de secours affichés une fois et téléchargeables.
62. [moi] Étape facultative « Protège ton compte » après l'inscription.
63. [moi] Serveur : sessions (`GET /auth/sessions`, navigateur et système déduits du user agent, suppressions).
64. [moi] Profil : sessions actives. Vérif : critère 8.
65. [moi] Serveur : export ZIP de CSV, sans aucun secret.
66. [moi] Serveur : `DELETE /auth/me/projects/:project`.
67. [moi] Serveur : `DELETE /auth/me`, journal des suppressions, mail.
68. [moi] Profil : mes données (export, suppression d'un projet, suppression du compte). Vérif : critère 11.

**Phase 8 — Interface et RGPD**

69. [moi] Header de la homepage (bouton, icône et pseudo affiché, déconnexion) ; icône de profil dans le Backlog et GDC ; avertissement de déconnexion, cache vidé.
70. [toi] Recette visuelle de toutes les pages en dev.
71. [moi] Commande « après restauration » du serveur, branchée dans `citadel restore-db` ; volume du journal dans `compose.yml` ; phrase ajoutée au message du bandeau.
72. [moi] Page « Données personnelles » (§10.6).
73. [nous] Vérification CNIL (§10.4) et cookies posés par Cloudflare.
74. [moi] Revue de sécurité : aucun secret dans les logs ni dans `error_log` (critère 6), CSP compatible avec les nouvelles pages, `pnpm audit`.

**Phase 9 — Recette et release**

75. [moi] Variables et secrets dans `.env.example` et `infra/compose.yml` ; `docs/architecture.md` et README à jour.
76. [toi] Secrets créés dans Bitwarden puis mis dans `.env.prod` : `AUTH_CODE_HMAC_KEY`, `AUTH_TOTP_ENCRYPTION_KEY` et sa version, nouveau `ADMIN_PASSWORD_HASH`.
77. [nous] Recette en `pnpm prod:local` : les 15 critères du §12.2, un par un.
78. [nous] Fusion (`git merge --no-ff`), puis `pnpm release`. Les migrations suppriment les données des projets : en cas de retour arrière, `citadel restore-db pre-deploy` avant `citadel rollback`.
79. [toi] En prod : inscription réelle, mails reçus, 2FA, sessions, IP réelle vue à travers Cloudflare, connexion à la console.
80. [toi] Deux semaines plus tard : aucun mail de l'authentification en indésirables, rapports DMARC propres.

---

## 16. Questions

Aucune.

---

## Annexe : fichiers du repo à relire

- `apps/admin/src/server/auth/` ; `apps/admin/src/server/http/writeAuditLog.ts` ; `packages/common/src/universal/cookie/`.
- `apps/server/src/` : `app.ts`, `globalRouter.ts`, `middleware/globalErrorHandler.ts`, `configuration/env.ts`, `error/`, `projects/errorLog/`, `sql/migrations/`.
- `packages/specs/src/specUtils/` : `apiPrefix.enum.ts`, `httpStatutCodeError.enum.ts`, `endpointModel.type.ts`, `error/`.
- `apps/client/src/` : `common/api/fetch/fetchHandler.ts`, `common/api/error/ApiError.ts`, `configuration/tanStackQueryClient.ts`, `react/appNavigation/`, `projects/homepage/components/Header/`, `projects/homepage/content/footerPages.ts`.
- `infra/Caddyfile`, `infra/compose.yml`, `infra/citadel`, `packages/eslint-config/eslintConfigCommon.js`.
- `docs/architecture.md` ; `docs/ci_cd/README.md` ; `docs/ci_cd/cahier_des_charges.md` (les mails).
