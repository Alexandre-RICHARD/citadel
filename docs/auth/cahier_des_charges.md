# Authentification de Citadel — Cahier des charges

2 novembre 2026 · v7 : tables `mailing_*`, pseudo en `A-Z a-z 0-9 _ -`, pseudo sensible à chaque caractère, email sans distinction de casse, réglages des mails dans le `.env`, tests partout, modèles par phase · v6 : relecture après les mails (quota, second facteur, restauration, règle des 3 mois), roadmap en fondations, mise en place, correctifs, modèle de Claude par phase · 30 octobre 2026 · v5 : dernières réponses intégrées, restauration et sujets d'infra passés au cahier de l'hébergement · v4 : réponses du 30 octobre intégrées · v3 : plus de MVP · v2 : aligné sur le dépôt · v1 : brouillon du 27 octobre

[Citadel](../../README.md) › Authentification : cahier des charges

Ce que l'authentification doit faire, ancré dans le code existant. Aucun code ici. Je code et tu relis. Prochaine étape : l'étape 70 de la roadmap (§15), phase 9.

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
17. Vérifications de fin
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

Je code, avec des tests unitaires et d'intégration pour tout ; tu testes à partir de la recette visuelle (§15). Design de l'authentification travaillé comme celui du reste du site.

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
- **MariaDB 11.8** : collations `utf8mb4_bin` (chaque caractère compte) et UCA 14 `utf8mb4_uca1400_as_ci` (accents distingués, casse ignorée).

### 3.2 À corriger dans le chantier

| # | Constat | Correction |
|---|---|---|
| 1 | `scryptSync` dans la console : synchrone, paramètres faibles | `argon2id` asynchrone partagé (§6.3, §11.2) |
| 2 | Serveur limité à 256 Mo | Concurrence des hashs plafonnée (§6.3) |
| 3 | `packages/common` sans environnement Node ; code Node et fonctions pures en double entre la console et le serveur | `src/node/` et son bloc ESLint, code commun regroupé (§11.2) |
| 4 | `POST /error-log/entries` public, jamais appelé par le front | Endpoint supprimé avec son interface dans les specs. `logError`, son service et la table `error_log` restent : le serveur y enregistre ses erreurs |
| 5 | `logError` peut stocker un corps de requête ; `error_log` sans durée | Hygiène (§7.5), purge à 20 jours (§10.2) |
| 6 | Tables des mails sans préfixe commun (`mail_failure`, `contact_message_unsent`) | Renommées `mailing_failure` et `mailing_contact_message_unsent` (V013) : un préfixe par sujet (`backlog_`, `gdc_`, `mailing_`, `auth_`) |
| 7 | Réglages des mails en dur ou commentés dans `.env.example` | Variables du `.env` (§9.2) |
| 8 | `protected` à `false` partout, ignoré par le serveur ; faux `Authorization: Bearer FakeToken` dans le `fetchHandler` du front | `protected` lu par le serveur (§6.11) ; faux `Bearer` supprimé |
| 9 | `AppError` sans 401 | Erreur créée ; `AuthErrorCodeEnum` ajouté à `ErrorCode` |
| 10 | Collation `utf8mb4_unicode_520_ci` : casse **et** accents ignorés dans les comparaisons (`=`, `UNIQUE`, `WHERE`) | Voulu ailleurs (chercher « pokemon » trouve « Pokémon ») : aucune migration globale. Colonnes de l'auth réglées une par une (§5.3) |

Faits par le chantier de l'hébergement, avant celui-ci : CSP, `pnpm audit` et Dependabot, logs à 90 jours (job `log-retention`), restauration depuis la console et bandeau du site. Faits par les mails : IP réelle (`realClientIp`), `429` et `Retry-After` jusqu'au front, `ForbiddenError` et `TooManyRequestsError`, `mailService` et son quota (alertes testées par `mailService.integration.test.ts`). Les mails (fournisseur, DNS, `contact@`) sont son [cahier des charges](../ci_cd/cahier_des_charges.md).

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

CSRF : `SameSite=Lax`, mutations en `POST`/`PATCH`/`DELETE`, contrôle de l'en-tête `Origin` sur les requêtes non sûres : un autre hôte → `403` ; absent, accepté (un navigateur l'envoie toujours sur ces requêtes ; la console et les jobs du NAS, non).

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
| `backlog_series` | `user_id` nullable : vide pour une série IGDB commune, rempli pour une série créée à la main (cascade) ; un `CHECK` l'impose |
| Tables IGDB (`backlog_game`, `backlog_version`, `backlog_version_platform`, `backlog_dlc`, `backlog_company`, `backlog_platform`) | Aucun : données communes |
| `error_log` | Purge à 20 jours |

Un jeu du backlog ne se range que dans une série IGDB ou une série de son propriétaire ; « Nouvelle série… » ne retrouve un nom que parmi celles-là. Un jeu en base (données IGDB) est à tous : celui du backlog d'un autre reste dans « Ma base ».

Les données du Backlog d'un utilisateur (suppression du compte ou du projet) sont supprimées par le serveur, dans une transaction, enfants d'abord : `backlog_user_game`, `backlog_user_version`, puis ses séries. `backlog_user_game.series_id` est en `RESTRICT` et son `CHECK` interdit `SET NULL` : l'ordre des cascades ne doit rien décider.

### 5.2 Tables de l'auth

Migrations du chantier à partir de V013 (V011 et V012 sont celles des mails) : V013 renomme les tables des mails, les tables de l'auth suivent. Toutes s'appellent `auth_*`. Conventions des migrations existantes : InnoDB, `utf8mb4`, `created_at` et `updated_at` en `DATETIME(3)`, `field` explicite dans Sequelize. Toute table liée à un utilisateur a une clé étrangère `ON DELETE CASCADE` vers `auth_user`.

**`auth_user`**

| Colonne | Type | Notes |
|---|---|---|
| `id` | INT, auto-incrément | |
| `email` | VARCHAR(254), unique | Tel que saisi ; jamais d'espace (le front bloque l'envoi, le serveur fait un `trim`) ; collation §5.3 |
| `username` | VARCHAR(64), unique | Identifiant, définitif ; collation §5.3 |
| `display_name` | VARCHAR(64), nul | Pseudo affiché ; vide = `username` ; règles du §6.2, aucune unicité |
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
| `step` | ENUM | `mail_code`, `second_factor`, `new_password` ; un `CHECK` n'accepte que les étapes du parcours |
| `user_id` | INT, nul | Vide pour une inscription |
| `email` | VARCHAR(254) | Adresse du mail |
| `payload` | JSON, nul | Inscription : `username`, `passwordHash` ; changement d'email : `newEmail` |
| `code_hmac` | BINARY(32), nul | Empreinte HMAC du code |
| `link_token_hash` | BINARY(32), nul | SHA-256 du jeton du lien |
| `attempts`, `send_count` | INT | |
| `remember` | BOOLEAN | Appliqué à la session finale |
| `last_sent_at`, `expires_at` | DATETIME(3) | |
| `created_at`, `updated_at` | DATETIME(3) | |

**`auth_factor`** : `id`, `user_id`, `type` (ENUM `email`, `totp`), `name` (VARCHAR(50)), `secret_encrypted` (VARBINARY(255), nul), `key_version` (TINYINT, nul), `last_used_step` (INT, nul : suffit jusqu'à l'an 4000, un BIGINT arriverait en chaîne), `last_used_at`, `confirmed_at` (nul tant que le premier code n'est pas validé : facteur inactif, purgé après 15 minutes), `created_at`, `updated_at`. Un seul facteur `email` par compte.

**`auth_recovery_code`** : `id`, `user_id`, `code_hash` (BINARY(32)), `used_at` (nul), `created_at`, `updated_at`.

**`auth_event`** : `id`, `user_id` (nul), `type` (VARCHAR(50) : un nouveau type sans migration), `ip` (tronquée comme dans `auth_session`), `user_agent`, `created_at`, `updated_at`. Purge à 20 jours (§10.2).

### 5.3 Collations et types

- Empreintes en `BINARY(32)` : comparaison octet par octet.
- Email : `utf8mb4_uca1400_as_ci` sur la colonne (et sur `auth_flow.email`), comme les messageries : la casse ne compte pas (`Alex@…` et `alex@…` sont la même adresse), les accents oui (`josé@…` et `jose@…` sont deux adresses, RFC 6531). Le mail part à l'adresse telle que saisie. La collation confond aussi `ａ` (pleine chasse) et `a`, `ﬁ` et `fi`, et ignore les caractères invisibles : la règle de format de l'email les refuse (étape 33).
- Pseudo : `utf8mb4_bin`, toute différence de caractère compte : `Alex` et `alex` peuvent coexister.
- Aucune migration de collation sur les tables existantes.

---

## 6. Parcours, feature par feature

### 6.1 Commun à tous les parcours

- **`auth_flow` + cookie de parcours** : tout parcours en plusieurs étapes (inscription, connexion avec 2FA, connexion par mail, mot de passe oublié, changement d'email, activation du facteur mail) a une ligne `auth_flow` et un cookie `HttpOnly` dédié, valable le temps du parcours : `__Host-citadel_flow` (même règle de préfixe que la session), `SameSite=Lax`, `Path=/`, `Max-Age` = durée du parcours. Un parcours par navigateur : en commencer un autre supprime le précédent.
- **Reprise** : une page `/auth/...` demande au serveur s'il y a un parcours en cours et se replace à la bonne étape. Les champs tapés (sauf les mots de passe) sont gardés dans le `sessionStorage` de l'onglet. Au retour sur l'onglet (`visibilitychange`), le front redemande l'état : si le lien a été ouvert dans un autre onglet du même navigateur, la page passe d'elle-même à la suite.
- **Lien et code dans chaque mail** :
  - le **code** (6 chiffres, empreinte HMAC, usage unique, invalidé par un renvoi, qui remet les essais à zéro) se colle dans la page restée ouverte, y compris sur un autre appareil ;
  - le **lien** (jeton de 32 octets, haché) ne marche que dans le navigateur qui a commencé le parcours. Ailleurs, la page dit d'utiliser le code (`LINK_OTHER_BROWSER`). Sinon, un attaquant lance une connexion avec ton email, tu cliques, et c'est son navigateur qui est connecté. Le jeton voyage dans le fragment (`/auth/verify#…`), jamais envoyé à un serveur ni écrit dans un journal ;
  - la page d'arrivée du lien (`/auth/verify`) demande un clic de confirmation (`POST`) : les antivirus de messagerie ouvrent les liens pour les analyser.
- **Temps restant** : chaque réponse renvoie `expiresIn` et, pendant le délai de renvoi, `resendRetryAfter`, en secondes (jamais une date : l'horloge du navigateur peut différer), et les essais restants.
- **Parcours leurre** : connexion par mail et mot de passe oublié d'un identifiant inconnu (ou d'une méthode fermée) créent un parcours sans compte ni code (V020), comme une inscription au champ piège rempli (sans compte en attente) : même cookie, même état, mêmes limites, aucun mail.
- **Expiration** : un parcours expiré est refusé à la lecture ; une minuterie du serveur supprime les lignes expirées (`auth_flow`, `auth_session`) et les facteurs non confirmés depuis plus de 15 minutes toutes les 15 minutes, et les vieilles lignes de `auth_event` et `error_log` une fois par jour.
- **Réponses neutres** : rien ne dit si un email existe, ni le contenu, ni la durée (mail envoyé après la réponse, §8.1).

### 6.2 Inscription

1. **Formulaire** : email, pseudo, mot de passe, confirmation du mot de passe, case « Se souvenir de moi ».
   - Pseudo : 1 à 64 caractères parmi `A-Z`, `a-z`, `0-9`, `_` et `-`, sans espace, définitif. Le pseudo affiché (§6.6) est libre : 1 à 64 caractères, accents, espaces et symboles compris, normalisé en NFC, espaces de début et de fin retirés, espaces consécutifs réduits à un, ni caractère de contrôle ni caractère invisible. Bouton « Vérifier la disponibilité » à côté du champ.
   - Mot de passe : barre de force sous le premier champ (§6.3) ; le second signale une différence ; une icône œil affiche ou masque les deux.
   - Messages : « Tu as 30 minutes pour terminer ton inscription, sinon il faudra recommencer. » ; « Utilise un mot de passe différent pour chaque site, idéalement avec un gestionnaire de mots de passe. » ; conditions du mot de passe qui passent au vert en direct.
   - Les champs incorrects sont coloriés à l'envoi.
2. **Serveur** : inscriptions fermées par l'interrupteur ou le quota de mails (`MAIL_REGISTRATION_STOP`) → `403` `REGISTRATION_CLOSED` ; le front le sait par `GET /mail/status` (bouton désactivé, bandeau « Les inscriptions sont fermées pour aujourd'hui, elles rouvrent demain. »). Pseudo pris → `409` `USERNAME_TAKEN`. Sinon, création d'un `auth_flow` `registration` ; réponse toujours « un email t'a été envoyé ».
3. **Mail** :
   - adresse nouvelle : « Confirme ton inscription » + lien + code ;
   - adresse déjà inscrite : « Tu as déjà un compte sur ce site, dernière connexion il y a 3 semaines » + lien vers la connexion, sans code. Durée floue : « aujourd'hui », puis 1 à 7 jours, 1 à 5 semaines, 1 à 12 mois, puis en années.
4. **Code ou lien validé** : création de `auth_user` (pseudo revérifié), suppression du parcours, session ouverte. Pseudo pris entre-temps : `409` `USERNAME_TAKEN`, le parcours reste ouvert et la page redemande un pseudo.
5. **Étape facultative** : « Protège ton compte avec une application d'authentification » (§6.7), puis retour à la page demandée au départ.

Une nouvelle inscription avec la même adresse remplace le parcours en attente : la personne qui reçoit les mails gagne toujours.

### 6.3 Mots de passe

- **Règles** (specs, partagées avec le front) : 12 à 128 caractères, aucune règle de composition. Normalisé en NFC (front et serveur) avant le contrôle de longueur et le hash.
- **Barre de force** : petite fonction testée, sans bibliothèque : longueur, variété des caractères, répétitions (`aaaa`), suites (`1234`, `abcd`), rangées de clavier (`azerty`, `qwerty`). Indicative, elle ne bloque rien. Un « ? » à côté explique sa limite : elle surestime un mot du dictionnaire maquillé (`P@ssw0rd!`).
- **Jamais le même** : changer son mot de passe (profil ou mot de passe oublié) pour le mot de passe actuel est refusé (`400` `PASSWORD_UNCHANGED`).
- **Hash** : `argon2id` natif, asynchrone, minimum OWASP (19 Mio, 2 passes, parallélisme 1) ; 2 hashs simultanés au plus, 20 en attente au plus ; au-delà, `503` `AUTH_BUSY` + `Retry-After`.
- **Format auto-descriptif** : algorithme et paramètres dans la chaîne stockée, séparés par `:`, sans `$` (la console garde son hash dans `.env.prod`). Si les paramètres montent, chaque mot de passe est refait à la connexion suivante de son propriétaire (c'est le seul moment où le serveur le connaît) ; les anciens hashs restent valables d'ici là.
- **Comparaison à temps constant** ; **hash factice** pour un identifiant inconnu (même délai qu'un mauvais mot de passe).

### 6.4 Connexion

- **Page** : identifiant (email ou pseudo ; un pseudo ne contient jamais `@`), mot de passe, case « Se souvenir de moi », lien « Recevoir un lien de connexion par email » et lien « Mot de passe oublié ».
- **Par mot de passe** : sans 2FA, session immédiate. Avec 2FA, `auth_flow` `login` à l'étape `second_factor` : l'utilisateur choisit un TOTP, un code reçu par mail ou un code de secours. Aucune session avant la fin.
- **Par mail** : email ou pseudo → mail (lien + code) → TOTP ou code de secours si un TOTP existe (le mail remplace le mot de passe, jamais le TOTP). Le code par mail n'y est jamais proposé comme second facteur : la boîte vient d'être prouvée. Si le seul facteur est le mail, rien de plus n'est demandé : il ne protège que d'un mot de passe volé.
- **Méthodes** : choisies dans le profil, « Je préfère pouvoir me connecter : Par email / Par mon pseudo (et mot de passe) / Les deux » (défaut : les deux). Une méthode fermée répond comme un échec ordinaire : `401` `INVALID_CREDENTIALS` pour le mot de passe, réponse neutre sans mail pour le lien. « Par email » seulement : le mot de passe reste exigé pour les actions sensibles (§6.6) ; oublié, il se refait par « Mot de passe oublié », toujours ouvert.
- **Échec** : même message pour un identifiant inconnu et un mauvais mot de passe.
- **Déjà connecté** : la page de connexion redirige vers le profil ou la page demandée ; une nouvelle connexion dans le même navigateur supprime l'ancienne session.
- `last_login_at` à chaque connexion ; `last_seen_at` avec la session.

### 6.5 Mot de passe oublié

Email ou pseudo → réponse neutre → mail (lien + code) à l'adresse du compte, jamais affichée → TOTP ou code de secours si un TOTP existe, jamais le code par mail (comme GitHub, et comme le recommande OWASP : sinon, une boîte mail compromise suffit à contourner la 2FA) → nouveau mot de passe, deux fois, différent de l'actuel → toutes les sessions supprimées → connecté.

### 6.6 Profil

Page `/auth/profile` :

- **Identité** : pseudo (définitif), pseudo affiché (modifiable, vide = pseudo), email.
- **Email** : mot de passe, puis lien + code à la **nouvelle** adresse ; remplacement après validation ; notification à l'ancienne. Adresse déjà inscrite : même réponse, et le mail à cette adresse dit qu'un autre compte a voulu la prendre, sans lien ni code. Prise entre la demande et la validation : `409` `EMAIL_TAKEN`.
- **Mot de passe** : ancien + nouveau deux fois, différent de l'ancien ; toutes les autres sessions supprimées.
- **Sécurité** : facteurs de 2FA, codes de secours, méthodes de connexion (§6.4).
- **Sessions actives** (§6.8).
- **Mes données** : export, suppression des données d'un projet (une case par projet), suppression du compte (§6.9).
- **Actions sensibles** (mot de passe, email, suppression d'un facteur, suppression de données ou du compte) : mot de passe redemandé, et second facteur pour supprimer le compte.

### 6.7 Double authentification

- **Par mail** : un code (+ lien) après le mot de passe, envoyé à la demande (`POST /auth/flow/resend` à l'étape « second facteur »). Activation confirmée par un premier code (parcours `email_factor`, 15 minutes), sans nouvelle session.
- **TOTP** : secret généré par le serveur ; QR code (`otpauth://`, émetteur « Citadel », email en libellé) généré **dans le navigateur**, plus la clé à saisir à la main. L'utilisateur nomme chaque facteur et peut en avoir plusieurs ; activation après un premier code valide. SHA-1, 6 chiffres, 30 s, ±1 pas. Anti-rejeu : un code accepté ne peut pas resservir, même pendant ses 30 à 90 secondes de validité. Secret chiffré en AES-256-GCM, avec la version de la clé et l'identifiant du facteur en donnée associée (AAD). Rotation : nouvelle clé et nouvelle version, l'ancienne gardée dans `AUTH_TOTP_PREVIOUS_ENCRYPTION_KEY` ; chaque secret est rechiffré à son prochain usage.
- **Codes de secours** : la roue de secours du second facteur (téléphone perdu, boîte mail inaccessible). Générés à l'activation du premier facteur, quel que soit son type ; 10 codes à usage unique de 10 caractères en Base32 (groupes de 5), gardés en HMAC avec `AUTH_CODE_HMAC_KEY` (50 bits résisteraient mal à une recherche hors ligne). Donnés par la réponse qui active le premier facteur (`recoveryCodes` de `/factors/totp/confirm`, ou du `{ flow }` qui termine l'activation du facteur mail). Affichés une seule fois : « Sauvegarde-les en lieu sûr : tu ne pourras plus jamais les revoir ici. », avec téléchargement en texte. Régénérables avec le mot de passe, ce qui invalide les anciens ; le profil affiche le nombre restant.
- **Gestion** : liste (nom, type, création, dernier usage), ajout, suppression confirmée par le mot de passe. Supprimer le dernier facteur désactive la 2FA et supprime les codes de secours.

### 6.8 Sessions actives et déconnexion

- Liste : navigateur et système (déduits du user agent), dernière activité, création, fin prévue, IP tronquée, « cette session ». Actions : déconnecter une session, « tout déconnecter », « tout déconnecter sauf ici ».
- **Déconnexion** : sans confirmation ; avertissement seulement s'il reste des mutations en cours ou un formulaire modifié (`useBlocker`, comme `useProjectChangeTransition`).
- Le cache de TanStack Query est vidé à la déconnexion (`queryClient.clear()`).
- Dans les autres onglets, le prochain appel reçoit un `401` et renvoie vers `/auth/login`.
- Une session d'un autre compte, ou qui n'existe plus : `404` `SESSION_NOT_FOUND`. Se déconnecter de la session en cours, ou de toutes, efface aussi le cookie.

### 6.9 Suppression et export

- **Suppression du compte** : mot de passe, plus un code de l'application d'authentification (ou un code de secours) quand le compte en a une (`400` `SECOND_FACTOR_REQUIRED` sinon) ; jamais le code par email, qui demanderait un mail de plus : un compte qui n'a que ce facteur n'en doit pas, comme à la connexion par email. Puis un écran : « La suppression est immédiate et définitive. Aucun délai de récupération. » Tout part par cascade ; mail de confirmation. Les sauvegardes l'oublient en 3 mois au plus (§10).
- **Suppression des données d'un projet** : une case par projet, mot de passe ; le compte reste.
- **Export** : « Télécharger mes données » (un simple lien `GET`, le cookie de session suffit) → un ZIP avec un CSV par table, toutes les lignes de l'utilisateur, sans aucun secret (ni hash, ni empreinte, ni secret TOTP). ZIP sans compression, fait sans bibliothèque.

### 6.10 Où se connecter dans l'interface

- **Homepage** : le bouton « Se connecter » du header mène à `/auth/login`. Connecté : icône utilisateur + pseudo affiché (vers le profil), et bouton « Se déconnecter » à côté.
- **Backlog et Game Death Counter** : une petite icône de profil dans leur interface.
- Le projet `auth` n'apparaît ni dans la roue ni dans le pied de page.

### 6.11 Protection des endpoints et des projets

- `protected` (specs) est lu par le routeur typé du serveur : `true` → session exigée (`401` sinon, ajouté tout seul aux erreurs possibles de l'endpoint), et le contrôleur reçoit l'identifiant de l'utilisateur.
- Chaque service et chaque requête sur une table d'utilisateur filtre par `user_id`. La ressource d'un autre utilisateur répond `404`. `user_id` vient toujours de la session, jamais du corps.
- **Accès des projets** (`ProjectDictionary`) : Homepage, Satisfactory et Angers Irigo publics ; Game Death Counter et Backlog privés, tous leurs endpoints `protected` (IGDB compris : son quota est partagé par tous les inscrits). Un projet privé renvoie un visiteur non connecté vers `/auth/login?redirect=…`, puis le ramène.
- **État connecté** : `useQuery` sur `GET /auth/me` (clé `["auth", "me"]`, `staleTime` de 30 s). Son `401` veut dire « pas connecté ». Un `401` `AUTHENTICATION_REQUIRED` sur toute autre requête (jamais `INVALID_CREDENTIALS`, qui reste une erreur de formulaire) vide le cache et redirige vers la connexion (`onError` des caches de requêtes et de mutations).
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
| `POST /auth/flow/code`, `/link`, `/second-factor`, `/new-password`, `/resend` | Étapes d'un parcours ; `code` et `link` acceptent un `username` qui remplace un pseudo pris entre-temps |
| `POST /auth/logout` | `204`, idempotent |
| `GET /auth/me`, `PATCH /auth/me` | Qui suis-je ; pseudo affiché, méthodes de connexion |
| `POST /auth/me/password`, `POST /auth/me/email` | Mot de passe ; changement d'email |
| `GET /auth/sessions`, `DELETE /auth/sessions/:id`, `DELETE /auth/sessions`, `DELETE /auth/sessions/others` | Sessions ; tout ; tout sauf ici |
| `GET /auth/factors`, `POST /auth/factors/totp`, `POST /auth/factors/totp/confirm`, `POST /auth/factors/email`, `DELETE /auth/factors/:id` | 2FA ; la suppression porte le mot de passe dans son corps |
| `POST /auth/recovery-codes` | Régénérer les codes de secours |
| `GET /auth/me/export`, `DELETE /auth/me/projects`, `DELETE /auth/me` | Export, suppressions ; `DELETE /auth/me/projects` vide en une fois (tous ou aucun) les projets de sa liste `projects` (`game-death-counter`, `backlog`) ; les suppressions portent le mot de passe (et, pour le compte, le code d'un TOTP) dans leur corps |

Chaque étape répond `{ flow }` : l'état du parcours (à l'étape « second facteur », ses `secondFactorMethods`), ou `null` quand il est terminé (session ouverte, ou facteur mail activé avec ses `recoveryCodes`).

Erreurs nouvelles : `401` (`AUTHENTICATION_REQUIRED`, `INVALID_CREDENTIALS`), `403` (`REGISTRATION_CLOSED`, `MAIL_CLOSED`), `400` (`PASSWORD_UNCHANGED`, `EMAIL_UNCHANGED`, `INVALID_CODE`, `CODE_ATTEMPTS_EXHAUSTED`, `LINK_OTHER_BROWSER`, `FLOW_EXPIRED`, `WRONG_PASSWORD`, `NO_SECOND_FACTOR`, `SECOND_FACTOR_REQUIRED`), `404` (`FACTOR_NOT_FOUND`, `SESSION_NOT_FOUND`), `409` (`USERNAME_TAKEN`, `EMAIL_TAKEN`, `EMAIL_FACTOR_ALREADY_ACTIVE`), `429` (`TOO_MANY_ATTEMPTS` + `Retry-After`), `503` (`AUTH_BUSY` + `Retry-After`). Le mot de passe redemandé avant une action sensible, faux, répond `400` `WRONG_PASSWORD` : un `401` voudrait dire « plus de session » ; ses échecs comptent comme ceux de la connexion.

---

## 7. Anti-abus et sécurité transverse

### 7.1 Menaces et parades

| Menace | Parade |
|---|---|
| Brute force sur un compte | 2 s entre deux essais, bannissement temporaire après 15 échecs, second facteur compris (§7.3) |
| Un mot de passe essayé sur beaucoup de comptes | Compteur par IP, puis bannissement temporaire |
| Verrouillage malveillant d'un compte | Délai et bannissement visent le couple compte + IP : un inconnu ne bloque pas ton compte |
| Énumération des comptes | Réponses et délais identiques (mails envoyés après la réponse), hash factice, inscription et mot de passe oublié neutres. Les pseudos, eux, sont publics par nature |
| Spam d'inscriptions | Limite par IP, parcours purgés, champ piège caché (honeypot) |
| Spam d'envoi de mails, quota du site épuisé | Délai de renvoi, limites par adresse ou identifiant tapé (en minuscules : les messageries ignorent la casse ; jamais l'email trouvé depuis un pseudo, qui lierait les deux) et par IP (20 par heure, 40 par jour), seuils du quota (cahier de l'hébergement, §2) |
| Rejeu d'un code ou d'un lien | Usage unique, durée courte, essais limités, lien lié au navigateur |
| Vol de session | Cookie `HttpOnly`/`Secure`, CSP, sessions révocables |
| CSRF | `SameSite=Lax`, `Origin`, `GET` sans effet |

Les limiteurs visent le compte trouvé, pas le texte tapé : alterner email et pseudo ne double pas les essais. Risque accepté (3 novembre 2026) : un échec par pseudo puis un essai immédiat par une adresse devinée montre le compte à rebours si les deux vont ensemble ; il faut déjà connaître le pseudo et deviner l'adresse exacte. Les erreurs de second facteur suivent la même règle.

### 7.2 IP réelle

Faite avec le formulaire de contact : Caddy écrase `X-Real-IP`, le serveur ne lit que lui (`realClientIp`). Reste : en IPv6, le bannissement vise le `/64`.

### 7.3 Délai et bannissement

- Succès : immédiat, compteur remis à zéro. Échec : `401`, puis aucun nouvel essai sur ce compte depuis cette IP avant 2 s (un inconnu ne bloque jamais ton compte). Après 15 échecs depuis la même IP sur le même compte : 15 minutes de `429` pour ce couple. Compteur remis à zéro après un succès ou 15 minutes de calme. Pendant un délai : `429` + `Retry-After` ; bouton désactivé avec compte à rebours.
- Les échecs de l'étape « second facteur » (TOTP, code par mail, code de secours) comptent comme ceux du mot de passe, pour le compte et pour l'IP : relancer des connexions ne donne pas d'essais en plus.
- Bannissement d'IP : 20 échecs en 10 minutes ou plus de 3 inscriptions par heure → 15 minutes de `429`.
- Compteurs en mémoire (une seule instance) : remis à zéro à chaque déploiement.

### 7.4 Détection basique

`auth_event` : échecs, inscriptions, parcours jamais confirmés, connexions, ajouts et suppressions de 2FA, changements de mot de passe ou d'email. Réponses proportionnées : bannissement temporaire, journal, notifications par mail. Pas de blocage définitif automatique.

### 7.5 Hygiène des journaux

Jamais de mot de passe, jeton, code, lien ni secret TOTP dans un log, un message d'erreur ou `error_log` ; aucune requête d'auth loguée avec son corps.

---

## 8. Mail

### 8.1 Envoi

- **Fournisseur, adresse `noreply`, DNS, expéditeur réel, en mémoire ou « journal »** : construits avant ce chantier, pour le formulaire de contact ([cahier de l'hébergement](../ci_cd/cahier_des_charges.md), §2, §5 et §6). Ce chantier y ajoute ses gabarits (§8.3), un `MailKindEnum` par mail (envoi et échecs par `mailService` et `mailing_failure`) et les règles ci-dessous.
- **Après la réponse** : les mails des réponses neutres (inscription, connexion par mail, mot de passe oublié, changement d'email) partent une fois la réponse envoyée, sans être attendus. Ni la durée ni un échec ne disent si le compte existe ; un échec va dans `mailing_failure` et les logs, jamais au visiteur.
- **Quota épuisé** (`isSendingOpen` faux) : connexion par mail, mot de passe oublié, changement d'email et activation du facteur mail répondent `403` `MAIL_CLOSED` (« Plus aucun email ne part aujourd'hui, réessaie demain. »), pour tout le monde. À l'étape « second facteur », le code par mail est grisé ; TOTP et codes de secours restent.
- **Brevo** (offre gratuite) ajoute un pixel d'ouverture et réécrit les liens par `r.mail.` : il voit passer les liens, sans effet grâce au lien lié au navigateur et au clic de confirmation (§6.1).

### 8.2 Réception : `contact@`

Mise en place avant ce chantier ([cahier de l'hébergement](../ci_cd/cahier_des_charges.md), §3).

### 8.3 Mails

HTML et texte brut, en français, mise en page de `buildMailBodies` : plusieurs phrases de vrai texte (délivrabilité, cahier de l'hébergement §2), une brique « code en gros » à ajouter, lien, durée de validité, « si tu n'es pas à l'origine de cette demande, ignore cet email ». Chaque gabarit a sa story dans le Storybook (`src/mailPreview`).

| Mail | Contenu |
|---|---|
| Inscription, adresse nouvelle | Lien + code |
| Inscription, adresse déjà inscrite | « Tu as déjà un compte, dernière connexion il y a… », lien vers la connexion |
| Mot de passe oublié | Lien + code |
| Connexion par mail | Lien + code |
| Second facteur par mail, activation du facteur mail | Code + lien |
| Changement d'email | Lien + code à la nouvelle adresse ; notification à l'ancienne. Adresse déjà inscrite : « un autre compte a voulu prendre cette adresse email », sans lien ni code |
| Notifications | Mot de passe changé, email changé, 2FA ajoutée ou retirée, compte supprimé |

---

## 9. Réglages et configuration

### 9.1 Un seul endroit

Toutes les durées et tous les seuils sont des variables d'environnement, déclarées une seule fois dans la section `auth` de `env.ts` (zod), avec leur valeur par défaut. Le code n'y accède que par `authSettings`. `.env.example` les liste toutes avec leur valeur (rien de sensible) ; `.env.test` raccourcit les durées utiles aux tests. Le front ne les connaît pas : le serveur lui renvoie `expiresAt` et `retryAfter`. Les réglages des mails suivent la même règle dans leur section `mail` (§9.2).

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
| `AUTH_MAILS_PER_IP_PER_HOUR`, `AUTH_MAILS_PER_IP_PER_DAY` | 20, 40 |
| `AUTH_FAILURE_DELAY_SECONDS` | 2 |
| `AUTH_ACCOUNT_FAILURES_BEFORE_BAN` | 15 |
| `AUTH_ACCOUNT_BAN_MINUTES` | 15 |
| `AUTH_FAILURE_RESET_MINUTES` | 15 |
| `AUTH_IP_FAILURES_BEFORE_BAN` | 20 |
| `AUTH_IP_FAILURE_WINDOW_MINUTES` | 10 |
| `AUTH_IP_BAN_MINUTES` | 15 |
| `AUTH_REGISTRATIONS_PER_IP_PER_HOUR` | 3 |
| `AUTH_USERNAME_CHECKS_PER_IP_PER_HOUR` | 60 (« Vérifier la disponibilité ») |
| `AUTH_ARGON2_MEMORY_KIB`, `AUTH_ARGON2_PASSES`, `AUTH_ARGON2_PARALLELISM` | 19456, 2, 1 |
| `AUTH_HASH_CONCURRENCY`, `AUTH_HASH_QUEUE_MAX` | 2, 20 |
| `AUTH_TOTP_ISSUER` | `Citadel` |
| `AUTH_TOTP_DRIFT_STEPS` | 1 |
| `AUTH_RECOVERY_CODES_COUNT` | 10 |
| `AUTH_FACTOR_CONFIRMATION_MINUTES` | 15 (facteur non confirmé, purgé ensuite) |
| `AUTH_EVENT_RETENTION_DAYS`, `ERROR_LOG_RETENTION_DAYS` | 20 |
| `AUTH_RESTORE_JOURNAL_DAYS` | 70 |
| `AUTH_RESTORE_JOURNAL_DIR` | `/var/lib/citadel/restore-journal` (image) ; `./.local/restore-journal` en dev |
| `AUTH_PURGE_INTERVAL_MINUTES` | 15 |

Mails (section existante, valeurs écrites et non plus commentées dans `.env.example` et `.env.test`) :

| Variable | Valeur |
|---|---|
| `MAIL_REGISTRATION_STOP`, `MAIL_CONTACT_STOP`, `MAIL_DAILY_LIMIT` | 250, 280, 300 (existent déjà) |
| `CONTACT_HOURLY_LIMIT_PER_IP` | 5 (existe déjà) |
| `BREVO_DAILY_CREDITS` | 300 (crédits de l'offre gratuite, en dur dans `brevoClient.ts`) |
| `MAIL_QUOTA_READING_SECONDS` | 60 (relevé du compteur de Brevo, en dur dans `createMailQuota.ts`) |
| `MAIL_FAILURE_RETENTION_DAYS` | 90 (en dur dans `createMailFailureQuery.ts`) |
| `MAIL_FAILURE_WINDOW_DAYS` | 7 (échecs résumés pour la console, en dur dans `mailService.ts`) |

### 9.3 Secrets (`.env.prod` + Bitwarden, créés avant d'être écrits)

`AUTH_CODE_HMAC_KEY` ; `AUTH_TOTP_ENCRYPTION_KEY` et sa version ; `AUTH_TOTP_PREVIOUS_ENCRYPTION_KEY`, vide hors rotation (§6.7). Valeurs quelconques dans `.env.test`. La clé du fournisseur de mails existe déjà (cahier de l'hébergement). Chaque variable va dans `.env.example` (bonne section, `[secret]` devant chaque secret) et dans `infra/compose.yml` (`site-prod-server`).

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
| `auth_event` (IP tronquée), `error_log` | 20 jours : avec les 10 semaines des sauvegardes, moins de 3 mois |
| Logs de Caddy et des conteneurs | 90 jours (job `log-retention` d'`infra/citadel`) |
| Sauvegardes de la base | Moins de 10 semaines (rétention dans `infra/citadel`) |
| Journal de restauration (§10.5) | 10 semaines, l'âge de la plus vieille sauvegarde |
| Mails chez Brevo (adresse, objet, ouvertures) | Durée de ses journaux, vérifiée avant la release (§15) |
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
| Pixel d'ouverture de Brevo dans les mails (« suivi anonyme ») | Statistiques d'envoi du fournisseur |

Tous dispensés de bandeau, à condition d'être décrits dans « Données personnelles ». Une étape de la roadmap vérifie ce point sur le site de la CNIL avant la release, ainsi que l'absence de cookie ajouté par Cloudflare hors sécurité et la position de la CNIL sur les pixels dans les mails : si elle exige un consentement, Brevo est remplacé [nous].

### 10.5 Sauvegardes et restauration

- **Rétention** (`infra/citadel`) : base, chaque jour : 14 jours + 4 dimanches + 2 premiers dimanches du mois ; dumps « avant déploiement » : les 2 derniers, 30 jours au plus. La plus vieille a moins de 10 semaines.
- **Restauration** (`citadel restore-db` ou la zone de danger de la console). Ce chantier y ajoute la commande « après restauration » du serveur (`build/afterRestore.cjs`), lancée juste après l'import, serveur encore arrêté (un conteneur jetable du service) : aucune requête ne passe avec une session ressuscitée. Elle reçoit la date de la sauvegarde (son nom, sinon la ligne `-- Dump completed on` du dump, lue à l'heure de Paris, moins une heure (elle marque la fin du dump) : un dump envoyé depuis le PC n'a pas forcément de date dans son nom). En échec, le serveur reste arrêté :
  - **le journal** : lignes JSON (identifiant et pseudo du compte, action, date ; nouvelle adresse pour un changement d'email, projets vidés, empreinte d'un code de secours utilisé) pour chaque suppression de compte ou des données d'un projet, changement d'email, changement de sécurité (mot de passe, facteur, codes de secours) et code de secours utilisé. Écrites en dernière étape de la transaction : une ligne qui ne s'écrit pas annule l'action. Le rejeu ne touche qu'un compte de même identifiant **et** de même pseudo : une restauration redonne des identifiants à d'autres comptes. Un fichier par jour (UTC), effacé quand son dernier instant a 10 semaines. Tenu hors de la base (sinon il serait restauré avec elle), dans `/Volume1/appdata/site-prod-server/restore-journal/` (donc dans `config-backup`), créé à `node` par `citadel deploy` ;
  - **rejouer le journal** après la date de la sauvegarde : suppressions refaites, changements d'email remis ; un compte qui a changé sa sécurité voit son mot de passe invalidé (à refaire par « Mot de passe oublié ») ;
  - **vider toutes les sessions et tous les parcours** : sinon, une session révoquée après la sauvegarde redevient valide.
- **Bandeau** : le message automatique de restauration gagne la phrase « Si tu as changé de mot de passe ou de double authentification pendant cette période, passe par « Mot de passe oublié ». »

### 10.6 Pages légales

- « Données personnelles » : responsable du traitement (toi, joignable par `contact@`) ; données des comptes, finalités et bases légales (exécution du service ; intérêt légitime pour la sécurité et les journaux) ; durées (§10.2) et règle des 3 mois ; IP tronquées dans les sessions et `auth_event` ; sauvegardes ; sous-traitants (Brevo, en France ; Cloudflare, aux États-Unis, sous le cadre de transfert UE–États-Unis) ; droits (export et suppression en libre-service, plus `contact@`) et réclamation auprès de la CNIL ; cookies, stockage et pixel (§10.4).
- Pas de conditions d'utilisation pour l'instant.

---

## 11. Organisation du code

### 11.1 Auth, un projet comme les autres

| Couche | Emplacement | Contenu |
|---|---|---|
| Specs | `packages/specs/src/projects/auth/` | Registre d'endpoints, `endpoint/<ressource>/<action>/`, `error/authErrorCode.enum.ts`, règles de format |
| Specs communes | `packages/specs/src/specUtils/` | `ApiPrefixEnum.AUTH`, `429`, `protected` lu par le serveur, code technique `AUTHENTICATION_REQUIRED` (le 401 de tout endpoint protégé) |
| Serveur | `apps/server/src/projects/auth/` | `router.ts`, `controller/`, `service/`, `query/`, `models/`, `bean/`, `mapper/`, `integrationTest/` |
| Serveur, transverse | `middleware/`, `error/`, `configuration/env.ts` | `requireSession`, IP réelle, `Origin` ; erreurs 401, 403, 429 ; section `auth` |
| Migrations | `apps/server/src/sql/migrations/V013__…` et suivantes | Tables `mailing_*` renommées, tables `auth_*`, `user_id` des projets |
| Front | `apps/client/src/projects/auth/` | `/auth/login`, `/auth/register`, `/auth/forgot-password`, `/auth/verify`, `/auth/profile`, `/auth/secure-account` (étape facultative après l'inscription) ; `useMe` ; `authErrorReasons.ts`, `authFieldLabels.ts` |
| Front, transverse | `react/appNavigation/`, homepage, Backlog, GDC | `ProjectsEnum.Auth` (thème de la homepage, `showcase: null`), accès de chaque projet, gestion du `401`, bouton du header, icône de profil ; plus de faux `Bearer` |

### 11.2 Code Node partagé : `packages/common/src/node/`

Bloc ESLint d'environnement pour `src/node/**` (`packages/eslint-config/eslintConfigCommon.js`), interdit aux dossiers du navigateur. Contenu : hash et vérification de mot de passe, comparaison à temps constant, jeton aléatoire (la console en tire déjà dans `sessionStore` et `newRequestId`), empreintes. Les fonctions pures en double entre la console et le serveur vont, elles, dans `src/universal/` : `fetchWithTimeout` (console, clients Brevo et IGDB), limiteur en mémoire à fenêtre glissante (`loginThrottle` de la console, limiteur du formulaire de contact, limiteurs de l'auth), contrôle d'origine (`requireSameOrigin` de la console, §4.2), `getParisDay` et `daysBefore` (mails). Chacune avec ses tests unitaires. Ce qui ne sert qu'au serveur (TOTP, chiffrement, parcours) reste dans le serveur. La console passe au même `argon2id` : `ADMIN_PASSWORD_HASH` à régénérer (`citadel admin-password`).

### 11.3 Bibliothèques

- **Natif** : `crypto.argon2`, `randomBytes`, `randomInt`, `createHash`, `createHmac`, `timingSafeEqual`, `createCipheriv` (AES-256-GCM) ; TOTP (RFC 6238, testé avec ses vecteurs officiels) et Base32 écrits à la main ; `readCookieValue` + `response.cookie` ; CSV et ZIP sans compression (`zlib.crc32`).
- **Une bibliothèque** : QR code côté front, petite et sans dépendance.

---

## 12. Ordre de construction et critères de fin

### 12.1 Ordre

Après les mails du cahier de l'hébergement, sur une branche dédiée, en trois parties puis la release :

1. **Fondations** : nettoyage, `packages/common/src/node`, tables `auth_*`, socle serveur (sessions, `protected`, purges, `auth_event`, limiteurs). Rien de visible ; les projets existants marchent comme avant.
2. **Mise en place** : mails, parcours, 2FA, profil, chacun serveur puis front. L'authentification marche seule ; GDC et Backlog restent publics.
3. **Correctifs** : l'existant passe aux comptes. Migration `user_id` et services filtrés dans le même commit, projet par projet ; accès des projets et `401` côté front ; données des projets dans l'export et les suppressions ; header et icônes ; restauration ; pages légales ; revue de sécurité.
4. **Recette et release** : critères §12.2 en `prod:local`, fusion de la branche, `pnpm release`.

### 12.2 Critères de fin

Tests unitaires pour chaque fonction pure (serveur, `packages/common`, front), tests d'intégration sur la vraie MariaDB de test pour chaque endpoint, chaque cas d'erreur et chaque migration (expirations comprises : dates calculées par Node, jamais par `NOW()` en SQL, et horloge avancée par Vitest), plus un passage manuel en `pnpm prod:local` :

1. Inscription : aucune ligne `auth_user` avant confirmation ; `Alex` et `alex`, `jose@` et `josé@` acceptés ensemble, `Alex@` refusé après `alex@` ; pseudo hors `A-Z a-z 0-9 _ -` refusé ; lien et code marchent ; une adresse déjà inscrite reçoit le bon mail ; écran identique dans les deux cas ; parcours refusé puis purgé après le délai ; disponibilité du pseudo exacte.
2. Connexion : identifiant inconnu et mauvais mot de passe donnent le même `401`, le même message, des délais comparables ; 2FA exigée quand elle existe ; ni la connexion par mail ni le mot de passe oublié ne contournent le TOTP, et le code par mail n'y est jamais proposé.
3. Délai et bannissement : `429` + `Retry-After` ; 2 s entre deux essais ; couple compte + IP banni après 15 échecs, compte toujours ouvert depuis une autre IP ; mot de passe correct de nouveau accepté après l'attente ; compteur par IP ; `/64` en IPv6 ; les échecs du second facteur comptés aussi.
4. Parcours : un rechargement reprend à la bonne étape ; un lien ouvert dans un autre navigateur est refusé ; la page d'arrivée exige un clic ; un code ne sert qu'une fois.
5. Cookie en `prod:local` : `HttpOnly`, `Secure`, `SameSite=Lax`, `Path=/`, pas de `Domain`, préfixe `__Host-`.
6. Aucun mot de passe, jeton, code ni secret en clair en base, dans les logs ou dans `error_log`.
7. `GET /auth/me` : `200` avec une session valide ; `401` sans cookie, avec un jeton altéré ou une session expirée.
8. Expiration glissante, plafond absolu, déconnexion, « tout déconnecter sauf ici ».
9. Mot de passe : même mot de passe refusé ; changement et réinitialisation suppriment les autres sessions.
10. Isolation : jamais d'accès aux données d'un autre (`404`) ; tous les endpoints `protected` renvoient `401` sans session.
11. Suppression du compte et des données d'un projet : plus aucune ligne concernée. Export : toutes les lignes, aucun secret.
12. IP réelle : celle du client.
13. Mails en boîte de réception chez Gmail et Outlook ; au moins 7/10 sur mail-tester.
14. Restauration en `prod:local` : suppressions et changements d'email rejoués, mot de passe invalidé après un changement de sécurité, sessions vidées, bandeau affiché avec sa phrase.
15. `pnpm validate-all` passe (types, lint, tests, builds, audit).
16. Quota : 40 mails par IP et par jour au plus ; quota épuisé, `MAIL_CLOSED`, inscriptions fermées et code par mail grisé ; mails des réponses neutres envoyés après la réponse, sans erreur visible en cas d'échec.

---

## 13. Après l'authentification

Hors de la définition de « fini » :

- **Console, en lecture seule** : comptes (métadonnées, jamais un secret), IP bannies, événements de sécurité ; compte MariaDB limité ou API interne, jamais depuis Internet. Les compteurs de bannissement passeraient alors en base.
- **Turnstile et limitation de débit de Cloudflare, CrowdSec** : si des abus apparaissent ; Turnstile sur les formulaires qui envoient un mail dès qu'un robot épuise le quota.
- **Complétion de profil** : `missingFields` dans `GET /auth/me` quand un champ obligatoire s'ajoutera ; `terms_accepted_version` si des conditions d'utilisation arrivent.
- **File d'envoi des mails** en base, si l'envoi pendant la requête pose problème.
- **Blocage temporaire d'un compte, par la console** : un bouton « bloquer » et « débloquer » dans la fiche d'un compte (suite de la console en lecture seule). Un compte bloqué refuse toute action : connexion, parcours, mails, endpoints `protected` ; ses sessions sont supprimées au blocage. Il suppose une colonne `blocked_at` dans `auth_user` et un contrôle dans le service des sessions, et lève la mention « toute action de la console sur les comptes » du §1.4. Les mails de sécurité (§8.3) renvoient déjà vers `contact@` pour ce cas : c'est le recours d'un compte détourné.
- **Notification « nouvelle connexion »**.
- **Remontée des plantages du front**, protégée par session et limitée par IP, si le besoin apparaît.
- Dans `docs/TODO.md` : `pnpm audit` et `pnpm outdated` dans la console.

---

## 14. Risques

| Risque | Parade |
|---|---|
| Beaucoup de code d'un coup | Ordre logique, chaque étape relue et testée, recette en `prod:local`, branche dédiée |
| IP partagée derrière Caddy | En-tête écrasé par Caddy, lu seul par le serveur, testé de bout en bout |
| Mémoire du serveur | 2 hashs simultanés au plus |
| Mails en indésirables | Fournisseur, SPF, DKIM, DMARC, tests Gmail et Outlook |
| Spam d'envoi de mails | Limites par adresse et par IP |
| Quota de 300 mails épuisé par quelques IP | 40 mails par IP et par jour, seuils et alertes du quota ; Turnstile si ça arrive (§13) |
| Quota d'IGDB partagé | Endpoints IGDB réservés aux connectés |
| Lien de connexion détourné | Lien lié au navigateur, clic de confirmation |
| Données personnelles dans les logs | Hygiène, purges |
| Restauration qui ressuscite comptes, données, sessions ou anciens mots de passe | Rejeu du journal, mots de passe invalidés, sessions vidées, bandeau |
| Calibrage des valeurs | Variables d'environnement, ajustables sans release |

---

## 15. Roadmap

Chaque étape [moi] est un commit relisible, avec ses tests unitaires et d'intégration (§12.2) ; `pnpm validate-all` passe à chaque commit. « Vérif » dit ce que les tests doivent prouver en plus. Avant la recette visuelle (étape 71), j'enchaîne sans test de ta part : les tests font foi. Trois parties (§12.1) : les **fondations**, puis la **mise en place** de l'authentification, seule, puis les **correctifs** qui font passer l'existant aux comptes ; enfin la recette et la release.

**Modèle de Claude Code**, effort medium, une session par phase :

- **Opus 5.5** : phases 0 à 3, 5, 6, 8 et 9 (sécurité, données, parcours) ;
- **Sonnet 5.5** : phases 4, 7 et 10 (gabarits, profil sur un socle déjà testé, docs), suivies d'une revue par Opus (`/code-review` sur le diff de la phase).

### Partie A — Fondations

**Phase 0 — Départ**

1. [moi] Branche `feat/auth` depuis `main` à jour. Vérif : `pnpm validate-all`.
2. [moi] Relecture du cahier contre le code du moment (écarts du §3.2, hook de `citadel restore-db`, bandeau) ; corrections du cahier si besoin, relues par toi.

**Phase 1 — Nettoyage et socle transverse**

3. [moi] Suppression de `POST /error-log/entries` (endpoint, specs, tests) ; `logError` et `error_log` restent.
4. [moi] `logError` n'enregistre jamais de corps de requête (§7.5).
5. [moi] Front : faux `Authorization: Bearer` retiré du `fetchHandler`.
6. [moi] Serveur : erreur 401 dans `AppError` et `globalErrorHandler` (`ForbiddenError` et `TooManyRequestsError` existent déjà).
7. [moi] Migration V013 : `mail_failure` → `mailing_failure`, `contact_message_unsent` → `mailing_contact_message_unsent`, index compris ; modèles, `countTableRows`, tests, textes de la console, `infra/citadel`, cahier de l'hébergement. Non rétrocompatible : sort avec la release, dont le retour arrière passe déjà par `citadel restore-db pre-deploy` (étape 81). Vérif : en tests, la migration garde les lignes.
8. [moi] Réglages des mails en variables (§9.2) : nouvelles variables dans `env.ts`, toutes écrites avec leur valeur dans `.env.example` et `.env.test`.
9. [moi] `packages/common/src/node/` et son bloc ESLint. Dans `universal/`, les fonctions pures en double (§11.2) : `fetchWithTimeout`, limiteur à fenêtre glissante, contrôle d'origine, `getParisDay`, `daysBefore`, avec la console et le serveur passés dessus. Vérif : un import de `node/` depuis le front échoue au lint ; console et formulaire de contact se comportent comme avant, en tests.
10. [moi] `common/node` : jeton aléatoire, SHA-256, HMAC, comparaison à temps constant ; la console (`sessionStore`, `newRequestId`) passe sur le jeton commun.
11. [moi] `common/node` : hash `argon2id` au format auto-descriptif, vérification, détection « à refaire », normalisation NFC, 2 hashs simultanés et 20 en attente au plus (file pleine : une erreur que le serveur traduit en `503` `AUTH_BUSY` à l'étape 40, `common` ne connaissant pas les codes des specs).
12. [moi] Console sur le même `argon2id` (`pnpm admin:password`, `citadel admin-password`). Vérif : connexion à la console avec un hash `argon2id`, en tests.
13. [moi] IP réelle, déjà lue par le serveur (formulaire de contact) : regroupement `/64` en IPv6. Vérif : deux IPv6 du même `/64` comptées ensemble, en tests.
14. [moi] Contrôle de l'en-tête `Origin` sur les requêtes non sûres, avec la fonction commune de l'étape 9.
15. [moi] Section `auth` de `env.ts`, `authSettings`, `.env.example`, `.env.test` (durées de la prod, hash léger, secrets de test) ; outil de test pour avancer l'horloge, qui remplace des durées raccourcies.
16. [moi] Chiffrement AES-256-GCM avec version de clé, identifiant en donnée associée, clé précédente pour la rotation (§6.7).

**Phase 2 — Base de l'authentification**

17. [moi] Migration `auth_user`, collations de l'email (`utf8mb4_uca1400_as_ci`) et du pseudo (`utf8mb4_bin`). Vérif : `Alex@` et `alex@` refusés ensemble, `josé@` et `jose@` acceptés ; `Alex` et `alex` acceptés, `Alex` en double refusé.
18. [moi] Migrations `auth_session` et `auth_flow`.
19. [moi] Migrations `auth_factor`, `auth_recovery_code`, `auth_event`.
20. [moi] Modèles Sequelize des tables `auth_*`.

**Phase 3 — Socle serveur**

21. [moi] Projet `auth` : `ApiPrefixEnum.AUTH`, registre d'endpoints, `router.ts`, `AuthErrorCodeEnum`, `authErrorReasons` côté front.
22. [moi] Service des sessions : création, lecture avec les trois expirations, prolongation toutes les 5 minutes, suppression.
23. [moi] Cookie de session : nom, attributs, `Max-Age` selon « se souvenir de moi ».
24. [moi] `protected` lu par le routeur typé : session exigée, `401` ajouté aux erreurs de l'endpoint, identifiant de l'utilisateur passé au contrôleur.
25. [moi] `GET /auth/me` et `POST /auth/logout`. Vérif : critère 7.
26. [moi] Purges : parcours et sessions toutes les 15 minutes, `auth_event` et `error_log` à 20 jours chaque jour.
27. [moi] Écriture des `auth_event` (§7.4), IP tronquée.
28. [moi] Limiteurs en mémoire : 2 s par compte, couple compte + IP banni après 15 échecs, bannissement d'IP, limites d'inscriptions et de mails (20 par heure et 40 par jour par IP). Vérif : critère 3 en tests.

### Partie B — Mise en place

**Phase 4 — Mail**

29. [moi] Gabarits de tous les mails (§8.3) sur `buildMailBodies`, avec la brique « code en gros » et un `MailKindEnum` par mail, chacun avec sa story dans le Storybook du design system (`src/mailPreview`, cahier de l'hébergement §6), durée floue de la dernière connexion.
30. [moi] Mails des réponses neutres envoyés après la réponse, échec dans `mailing_failure` sans erreur visible ; `403` `MAIL_CLOSED` quand le quota est épuisé (§8.1).

**Phase 5 — Parcours**

31. [moi] Service `auth_flow` : création, cookie `__Host-citadel_flow`, un parcours par navigateur, code HMAC, lien haché, essais remis à zéro au renvoi, expiration ; `GET` et `DELETE /auth/flow`, `POST /auth/flow/resend`.
32. [moi] `POST /auth/flow/code` et `/link`, lien lié au navigateur.
33. [moi] Règles de format dans les specs (pseudo en `A-Z a-z 0-9 _ -`, pseudo affiché libre en NFC, email inchangé par NFKC et sans caractère invisible, mot de passe en NFC, code) ; `GET /auth/usernames/:username/availability`.
34. [moi] Serveur, inscription : honeypot, interrupteur et quota (`REGISTRATION_CLOSED`), limites, réponse neutre, deux mails, remplacement d'un parcours en attente, pseudo pris à la confirmation, création du compte et de la session. Vérif : critère 1.
35. [moi] Front : projet `auth` (`ProjectsEnum.Auth`, routes, thème de la homepage), `useMe`, bandeau et bouton d'inscription fermés selon `GET /mail/status`.
36. [moi] Front, composants : champ mot de passe avec œil, barre de force et son « ? », champ code, temps restant, compte à rebours.
37. [moi] Front : reprise des parcours (`GET /auth/flow` au chargement et au retour sur l'onglet, `sessionStorage`).
38. [moi] Page d'inscription.
39. [moi] Étape « code ou lien » commune et page `/auth/verify`. Vérif : critère 4.
40. [moi] Serveur, connexion par mot de passe : hash factice, délais, rehash, méthodes fermées, `last_login_at`, passage au second facteur s'il existe.
41. [moi] Serveur, connexion par mail : TOTP ou code de secours ensuite, jamais le code par mail.
42. [moi] Page de connexion (mot de passe, lien par mail), déjà connecté redirigé. Vérif : critère 2 sans 2FA.
43. [moi] Serveur, mot de passe oublié : parcours, `/flow/new-password`, même mot de passe refusé, sessions supprimées, notification.
44. [moi] Page « mot de passe oublié ».

**Phase 6 — Double authentification**

45. [moi] TOTP et Base32 écrits à la main. Vérif : vecteurs officiels de la RFC 6238, dérive de ±1 pas, anti-rejeu.
46. [moi] Facteur TOTP : `POST /auth/factors/totp` et `/confirm`, secret chiffré.
47. [moi] Facteur mail : `POST /auth/factors/email` (parcours `email_factor`).
48. [moi] Codes de secours : création au premier facteur, usage unique, `POST /auth/recovery-codes`.
49. [moi] `/flow/second-factor` (TOTP, code par mail, code de secours) dans la connexion et le mot de passe oublié, échecs comptés par les limiteurs, code par mail grisé quand le quota est épuisé ; `GET` et `DELETE /auth/factors` ; notifications.
50. [moi] Front : étape « second facteur » de la connexion et du mot de passe oublié. Vérif : critère 2 avec 2FA.

**Phase 7 — Profil**

51. [moi] Serveur : `PATCH /auth/me` (pseudo affiché, méthodes de connexion).
52. [moi] Page de profil : structure, identité, méthodes de connexion.
53. [moi] Serveur : `POST /auth/me/password`.
54. [moi] Serveur : `POST /auth/me/email` (parcours `email_change`, notification à l'ancienne adresse, adresse déjà prise, `EMAIL_TAKEN`).
55. [moi] Profil : mot de passe et email. Vérif : critère 9.
56. [moi] Profil : 2FA (QR code dans le navigateur, bibliothèque choisie ici), codes de secours affichés une fois et téléchargeables. Le facteur mail s'active aussi par son lien : `/auth/verify` reçoit alors les `recoveryCodes` et doit les montrer (le parcours `email_factor` mène aujourd'hui à la connexion, `findFlowPagePath`).
57. [moi] Étape facultative « Protège ton compte » après l'inscription.
58. [moi] Serveur : sessions (`GET /auth/sessions`, navigateur et système déduits du user agent, suppressions, `DELETE /auth/sessions/others`).
59. [moi] Profil : sessions actives. Vérif : critère 8.
60. [moi] Serveur : export ZIP de CSV des tables de l'auth, sans aucun secret.
61. [moi] Serveur : `DELETE /auth/me`, mail.
62. [moi] Profil : mes données (export, suppression du compte).

### Partie C — Correctifs : l'existant passe aux comptes

**Phase 8 — Game Death Counter et Backlog**

63. [moi] GDC, jeux, dans un seul commit : migration `user_id` de `gdc_game` (lignes existantes supprimées : rien à garder, §1.2), données de test rattachées à un utilisateur, endpoints `protected`, filtrage par `user_id`, `404` chez un autre.
64. [moi] GDC, boss et morts : propriété par jointure jusqu'à `gdc_game`.
65. [moi] Backlog, dans un seul commit : migration `user_id` (`backlog_user_game`, `backlog_user_version`, `backlog_series`), données de test rattachées, tous les endpoints `protected` (IGDB compris), jeux suivis et versions filtrés par `user_id`.
66. [moi] Backlog, séries manuelles et DLC par utilisateur ; un jeu ne se range que dans une série IGDB ou une des siennes. Vérif : critère 10 sur GDC et Backlog.
67. [moi] Serveur : suppression ordonnée du Backlog (§5.1) dans `DELETE /auth/me`, `DELETE /auth/me/projects`, export étendu aux tables des projets.
68. [moi] Front : accès des projets avec retour à la page demandée, gestion du `401` `AUTHENTICATION_REQUIRED`.
69. [moi] Profil : suppression des données d'un projet. Vérif : critère 11.

**Phase 9 — Interface, restauration et RGPD**

Ordre : 70, 73, 74, 75, 77, puis 76, close par ta validation technique ; ensuite revue et commits. 71 vient après 70 et 75, 72 quand tu veux.

70. [moi] Header de la homepage (bouton, icône et pseudo affiché, déconnexion) ; icône de profil dans le Backlog et GDC ; avertissement de déconnexion, cache vidé.
71. [toi] Recette visuelle de toutes les pages en dev.
72. [nous] Chaque gabarit envoyé depuis le dev vers Gmail et Outlook, et à mail-tester. Vérif : critère 13.
73. [moi] Journal de restauration (§10.5) écrit par chaque suppression, changement d'email et changement de sécurité ; volume dans `compose.yml`, purge à 10 semaines.
74. [moi] Commande « après restauration » du serveur (journal rejoué, mots de passe invalidés, sessions et parcours vidés), branchée dans `citadel restore-db` ; phrase ajoutée au message du bandeau.
75. [moi] Page « Données personnelles » (§10.6).
76. [nous] Vérification CNIL (§10.4) : cookies posés par Cloudflare, pixel de Brevo ; durée des journaux de Brevo (§10.2).
77. [moi] Revue de sécurité : aucun secret dans les logs ni dans `error_log` (critère 6), CSP compatible avec les nouvelles pages, `pnpm audit`.

En suspens (70, 73, 74, 75 et 77 faites) :

- 71 et 72 (de ton côté).
- 76 : cookies réellement posés par Cloudflare en prod ; pixel de Brevo face à la recommandation CNIL du 12 mars 2026 (délibération 2026-042 : dispense pour un mail transactionnel seulement si le pixel ne garde que la date de dernière ouverture ; suivi non désactivable sur l'offre gratuite) : garder, changer d'offre ou remplacer Brevo ; durée de conservation des journaux de Brevo (illimitée par défaut, à régler dans Retention rules), puis la préciser dans « Données personnelles ». Close par ta validation technique.
- À trancher : sortir le journal de restauration de `config-backup` (une archive de 2 mois qui contient 70 jours de journal dépasse les 3 mois) ; tutoiement du bandeau de restauration, sur un site qui vouvoie.
- `pnpm audit` : 2 « high » dans `brace-expansion`, sous des plugins ESLint (dev seulement) : override pnpm ou attendre Dependabot.

### Partie D — Recette et release

**Phase 10 — Recette et release**

78. [moi] Variables et secrets dans `.env.example` et `infra/compose.yml` ; `docs/architecture.md` et README à jour.
79. [toi] Secrets créés dans Bitwarden puis mis dans `.env.prod` : `AUTH_CODE_HMAC_KEY`, `AUTH_TOTP_ENCRYPTION_KEY` et sa version, nouveau `ADMIN_PASSWORD_HASH` (fait en local par `pnpm admin:password` : l'image de la nouvelle version n'existe pas encore).
80. [nous] Recette en `pnpm prod:local` : les 16 critères du §12.2, un par un.
81. [nous] Fusion (`git merge --no-ff`), puis `pnpm release`. Les migrations suppriment les données des projets : en cas de retour arrière, `citadel restore-db pre-deploy` avant `citadel rollback`.
82. [toi] En prod : inscription réelle, mails reçus, 2FA, sessions, IP réelle vue à travers Cloudflare, connexion à la console.
83. [toi] Deux semaines plus tard : aucun mail de l'authentification en indésirables, rapports DMARC propres.

---

## 16. Questions

Aucune question ouverte.

---

## 17. Vérifications de fin

Petites choses à tester à la main pendant la recette (étapes 80 et 82), en plus des 16 critères du §12.2. À cocher une par une ; une ligne qui échoue devient un correctif avant la release. Une fois la phase 9 finie, je peaufine cette liste ; tu testes alors tout (peut-être en end-to-end avec Playwright), puis tu dresses la liste de tous les points à modifier.

**Socle (phases 0 et 1)**

- [ ] `POST /api/error-log/entries` répond `404` et n'écrit rien dans `error_log`.
- [ ] Une erreur de base provoquée (inscription avec la base arrêtée) : la ligne de `error_log` et les logs du conteneur n'ont ni mot de passe, ni email, ni valeur de paramètre SQL, mais gardent le message du driver.
- [ ] Après la release : `mailing_failure` et `mailing_contact_message_unsent` existent, les anciennes tables non ; les deux alertes de la carte « Site » de la console comptent toujours.
- [ ] `citadel db-restore-test` passe après V013, puis après V020 (contraintes `CHECK`, colonne générée de `auth_factor`).
- [ ] Le job `contact-retry` renvoie toujours un message en attente.
- [ ] `MAIL_REGISTRATION_STOP` abaissé en dev : inscriptions fermées au bon seuil ; valeurs remises après.
- [ ] Le serveur refuse de démarrer sans `AUTH_CODE_HMAC_KEY`, avec une clé qui n'a pas 64 caractères hexadécimaux, ou avec une clé précédente et une version 1, en nommant la variable fautive.
- [ ] `pnpm prod:local` démarre ; la pré-prod démarre avec les clés de `.env.prod`.
- [ ] Console : `citadel admin-password` (dans l'image) et `pnpm admin:password` donnent une ligne `argon2id:` ; connexion avec ; un ancien hash `scrypt` empêche la console de démarrer, avec le message qui dit quoi faire.
- [ ] Console : 6 mauvais mots de passe d'affilée → `429` avec les minutes restantes ; un bon mot de passe après l'attente remet le compteur à zéro.
- [ ] Console : boutons d'action (démarrer, arrêter, bandeau) toujours acceptés depuis la console, refusés (`403`) par un `curl` sans `Origin`.
- [ ] Site : un formulaire posté depuis une page d'un autre domaine → `403` `FOREIGN_ORIGIN`, message traduit ; les `GET` d'un autre site passent.
- [ ] Formulaire de contact : deux IPv6 du même `/64` partagent la limite ; deux IPv4 voisines, non.

**Cookie et session**

- [ ] En prod : `__Host-citadel_session`, `HttpOnly`, `Secure`, `SameSite=Lax`, `Path=/`, sans `Domain` ; en dev : `citadel_session`, sans `Secure`.
- [ ] Sans « se souvenir de moi » : pas de `Max-Age` ; navigateur fermé puis rouvert (sans restauration des onglets) → déconnecté.
- [ ] Avec : `Max-Age` de 7 jours, renvoyé au plus toutes les 5 minutes (onglet Réseau).
- [ ] Le texte « Reste connecté 7 jours sans visite, 30 jours au plus » est sous la case, à la connexion et à l'inscription.
- [ ] Un cookie modifié à la main → `401`, retour à `/auth/login`.
- [ ] Connecté sur le PC et sur le téléphone : se déconnecter sur l'un laisse l'autre connecté.
- [ ] Déconnexion : `204`, deux fois de suite sans erreur ; les autres onglets renvoient vers la connexion à leur prochain appel ; aucune donnée du compte n'y reste affichée (cache vidé).
- [ ] Avertissement avant de se déconnecter avec un formulaire modifié, pas sans.

**Parcours (lien et code)**

- [ ] Rechargement à chaque étape (formulaire, code, second facteur, nouveau mot de passe) : on reprend au même endroit ; les champs sont gardés, jamais les mots de passe.
- [ ] Lien ouvert dans un autre onglet du même navigateur : l'onglet d'origine passe seul à la suite au retour.
- [ ] Lien ouvert sur le téléphone : la page dit d'utiliser le code ; le code tapé sur le PC marche.
- [ ] `/auth/verify` demande un clic ; ouvrir le lien sans cliquer ne valide rien.
- [ ] Code collé avec des espaces, ou depuis une notification : accepté. Code à 5 chiffres : bouton désactivé.
- [ ] Un code déjà utilisé, puis l'ancien code après un renvoi : refusés.
- [ ] 5 mauvais codes → refus, le renvoi remet les essais à zéro.
- [ ] Renvoi : bouton grisé 60 s avec compte à rebours ; le temps restant du parcours défile et la page dit quoi faire à zéro.
- [ ] Commencer un autre parcours dans le même navigateur abandonne le premier.
- [ ] Renvoi refusé par une limite de mails (`429`) : le bouton « Renvoyer » affiche l'attente imposée, pas seulement les 60 s.
- [ ] Code tapé pendant qu'un autre onglet renvoie l'email : « code faux », le parcours continue (jamais « recommence »).
- [ ] Le lien réécrit par Brevo (`r.mail.`) mène bien à `/auth/verify`.

**Inscription**

- [ ] `Alex` et `alex` créés tous les deux ; `Alex@…` refusé après `alex@…` ; `josé@…` et `jose@…` acceptés.
- [ ] Pseudo avec espace, accent ou `.` : refusé avant l'envoi ; 64 caractères acceptés, 65 non.
- [ ] Email avec une lettre pleine chasse (`ａlex@…`), une ligature (`ﬁ`) ou un caractère invisible collé (U+200B) : refusé avant l'envoi, et par le serveur.
- [ ] « Vérifier la disponibilité » : juste pour un pseudo pris, libre, ou différent seulement par la casse.
- [ ] Mot de passe de 11 caractères refusé, 12 accepté, 128 accepté, 129 refusé ; un « é » composé (e + accent) compte pour un caractère.
- [ ] Barre de force : basse pour `azertyuiop12`, `aaaaaaaaaaaa`, `123456789012` ; le « ? » explique qu'elle surestime `P@ssw0rd!`.
- [ ] L'œil affiche ou masque les deux champs ; une différence entre les deux est signalée ; les conditions passent au vert en direct.
- [ ] Les champs incorrects sont coloriés à l'envoi ; chaque champ obligatoire a son astérisque rouge.
- [ ] Message des 30 minutes et conseil du gestionnaire de mots de passe affichés.
- [ ] Bitwarden propose d'enregistrer le mot de passe (attributs `autocomplete`) et le remplit à la connexion.
- [ ] Adresse déjà inscrite : même écran, mail « Tu as déjà un compte… » avec une durée floue juste (aujourd'hui, jours, semaines, mois, années).
- [ ] Deux inscriptions avec la même adresse : seule la dernière se confirme.
- [ ] Pseudo pris entre l'envoi et la confirmation : la page redemande un pseudo, le code reste valable.
- [ ] Champ piège rempli (console du navigateur) : réponse normale, aucun compte ni mail, l'écran du code tient au rechargement ; une vraie inscription en attente à la même adresse reste valable.
- [ ] 6e inscription à la même adresse dans l'heure (refusée par la limite de mails) : l'IP n'est pas bannie pour autant.
- [ ] Inscriptions fermées (interrupteur, puis quota) : bouton désactivé, bandeau « …elles rouvrent demain. ».
- [ ] Après l'inscription : étape « Protège ton compte » passable, puis retour à la page demandée au départ.

**Connexion**

- [ ] Par email et par pseudo ; un pseudo ne contient jamais `@`.
- [ ] Identifiant inconnu et mauvais mot de passe : même message, même durée à l'œil.
- [ ] Deux essais à moins de 2 s : bouton désactivé avec compte à rebours.
- [ ] 15 échecs : `429` pour ce compte depuis cette IP ; le même compte s'ouvre depuis le téléphone en 4G.
- [ ] Un mauvais mot de passe toutes les 2 s depuis le téléphone en 4G : la connexion depuis le PC reste possible, sans compte à rebours.
- [ ] 20 échecs en 10 minutes sur plusieurs comptes : IP bannie 15 minutes.
- [ ] Les erreurs de second facteur comptent aussi.
- [ ] Méthode « par email » seule : la connexion par mot de passe échoue comme un mauvais mot de passe ; « par pseudo » seule : le lien par mail ne part pas, écran identique.
- [ ] Déjà connecté : `/auth/login` renvoie vers le profil ; une nouvelle connexion dans le même navigateur fait disparaître l'ancienne session de la liste.
- [ ] Connexion par mail avec un TOTP : le TOTP est demandé, jamais le code par mail ; avec seulement le facteur mail : rien de plus.
- [ ] Connexion par mail commencée, puis « par mot de passe » seule choisie dans le profil (autre onglet) : le lien et le code ne connectent plus.
- [ ] Mauvais mot de passe par pseudo, puis essai immédiat par l'adresse du même compte : compte à rebours (le délai vise le compte, §7.1) ; par l'adresse d'un autre compte : aucun.
- [ ] Paramètres argon2 montés dans `.env` : le hash d'un compte change à sa connexion suivante, l'ancien marchait encore.

**Mot de passe oublié**

- [ ] Réponse identique pour un compte existant ou non ; l'adresse n'est jamais affichée.
- [ ] Avec un TOTP : demandé après le lien ; le code par mail n'est pas proposé.
- [ ] Le mot de passe actuel est refusé (`PASSWORD_UNCHANGED`) ; après le changement, toutes les sessions (téléphone compris) sont fermées ; mail de notification reçu.

**Profil**

- [ ] Pseudo affiché : espaces de début, de fin et en double nettoyés ; vide → le pseudo ; caractère invisible (U+200B) refusé.
- [ ] Changement d'email : mot de passe demandé, lien et code à la nouvelle adresse, notification à l'ancienne ; adresse déjà prise : même écran et mail « un autre compte a voulu… » ; prise entre-temps : `EMAIL_TAKEN`.
- [ ] Changement de mot de passe : les autres sessions fermées, celle-ci gardée.
- [ ] Actions sensibles : mot de passe redemandé ; suppression du compte : second facteur en plus.

**Double authentification**

- [ ] QR code lu par Google Authenticator, Aegis et Bitwarden ; émetteur « Citadel », email en libellé ; clé manuelle qui marche aussi.
- [ ] Le secret n'apparaît dans aucune requête après celle qui le crée (onglet Réseau), ni dans les logs.
- [ ] Un code du pas précédent ou suivant accepté ; deux pas d'écart refusé ; le même code deux fois refusé.
- [ ] Deux TOTP nommés, puis le facteur mail ; liste avec type, date et dernier usage.
- [ ] Facteur mail activé depuis deux onglets à la fois : un seul dans la liste, l'autre onglet a un message clair (pas une erreur 500).
- [ ] Codes de secours : affichés une fois, téléchargés en texte lisible, chacun utilisable une fois, nombre restant juste ; régénération : les anciens ne marchent plus.
- [ ] Supprimer le dernier facteur désactive la 2FA et efface les codes de secours ; notification reçue.
- [ ] Rotation de clé (nouvelle clé, version 2, ancienne en clé précédente) : le TOTP marche, puis `key_version` passe à 2 après usage.
- [ ] Quota épuisé : code par mail grisé, TOTP et codes de secours toujours là.
- [ ] Étape « second facteur » : choix entre application, code par email et code de secours selon le compte ; « Recevoir un code par email » puis « Renvoyer l'email » avec son délai ; le lien de cet email, ouvert dans le même navigateur, connecte aussi.
- [ ] Code de secours tapé en minuscules, sans tiret ou avec des espaces : accepté.
- [ ] Bon mot de passe redonné entre de mauvais codes de second facteur : le 15e mauvais code bannit quand même le couple compte + IP.
- [ ] « Code par email » choisi, un code tapé sans avoir demandé l'email : refusé, sans compte à rebours ni essai consommé.
- [ ] « Renvoyer l'email » puis, aussitôt, le code du premier email : « code faux » (il est remplacé), un seul échec compté.
- [ ] Un mauvais second facteur apparaît en `second_factor_failed` dans `auth_event`, distinct d'un mauvais mot de passe (`login_failed`).
- [ ] Le même TOTP confirmé depuis deux onglets à la fois : un seul lot de codes de secours, l'autre onglet reçoit un message clair.
- [ ] Une dizaine de connexions par email terminées en même temps vers le second facteur (boucle de `curl` en parallèle) : aucune ne reste bloquée, aucune `DatabaseError`.

**Sessions et données**

- [ ] Liste : navigateur et système justes (Edge, Firefox, Android, iOS), IP tronquée, « cette session », fin prévue.
- [ ] Connexion avec un user agent de plus de 255 caractères (`curl -A`) : session ouverte, user agent tronqué dans la liste.
- [ ] Double clic sur « S'inscrire » : un seul compte créé, et le code du second mail éventuel répond proprement, sans erreur 500.
- [ ] « Tout déconnecter sauf ici » puis « tout déconnecter » (le second renvoie vers la connexion).
- [ ] Profil : pseudo affiché modifiable, vidé il redonne le pseudo ; les trois méthodes de connexion se choisissent et la connexion les respecte.
- [ ] Changement d'email : la nouvelle adresse reçoit le lien et le code, l'ancienne la notification ; adresse déjà inscrite : même écran, et seul son propriétaire reçoit un email, sans lien ni code ; lien ouvert dans un autre navigateur : refusé.
- [ ] Changement de mot de passe : l'ancien redemandé, le même refusé, les autres sessions fermées, celle-ci gardée.
- [ ] Ajout d'une application : le QR code se scanne (Google Authenticator, Aegis, Bitwarden), la clé saisie à la main marche aussi, le premier code active ; les codes de secours s'affichent une seule fois, se téléchargent, et ne reviennent pas au rechargement.
- [ ] Facteur mail activé par son lien (`/auth/verify`) plutôt que par son code : les codes de secours s'affichent sur le profil.
- [ ] Étape « Protège ton compte » après l'inscription : « Plus tard » mène à la page demandée ; la fin de l'activation montre les codes de secours avant d'y mener.
- [ ] Suppression du compte avec une application d'authentification : le code (ou un code de secours) est demandé en plus du mot de passe.
- [ ] Export : le ZIP s'ouvre avec l'explorateur Windows et 7-Zip ; les CSV gardent accents et émojis dans Excel ; aucun hash, empreinte ni secret.
- [ ] Suppression des données du Backlog seul : GDC intact ; suppression du compte : plus aucune ligne, mail de confirmation, reconnexion impossible.

**Projets**

- [ ] GDC et Backlog déconnecté : renvoi vers `/auth/login?redirect=…`, puis retour au même endroit après la connexion.
- [ ] Les endpoints IGDB répondent `401` sans session.
- [ ] Le jeu d'un autre compte (identifiant tapé dans l'URL) : `404`.
- [ ] Série créée à la main invisible pour un autre compte ; séries IGDB communes.
- [ ] Déconnecté depuis un autre onglet : la prochaine action dans GDC ou le Backlog mène à la connexion, qui ramène à la page ; rien du compte ne reste affiché.
- [ ] Un jeu enregistré par un compte apparaît dans « Ma base » d'un autre, sans sa personnalisation ; ajouté aux deux backlogs, chacun garde ses versions jouées.
- [ ] Profil : vider GDC et le Backlog d'un coup, puis l'un sans l'autre ; un mauvais mot de passe ne vide rien ; le projet vidé s'ouvre ensuite vide, sans rechargement.
- [ ] Header : « Se connecter », puis icône et pseudo affiché, et « Se déconnecter » ; icône de profil dans le Backlog et GDC ; `auth` absent de la roue et du pied de page.

**Mails**

- [ ] Chaque gabarit en clair et en sombre, sur mobile et sur ordinateur, dans Gmail et Outlook ; le code se copie d'un appui long sur mobile.
- [ ] Quota épuisé : `MAIL_CLOSED` et son message pour la connexion par mail, le mot de passe oublié, le changement d'email, l'activation du facteur mail.
- [ ] Brevo coupé (mauvaise clé) : l'inscription répond comme d'habitude, l'échec est dans `mailing_failure` et la console.
- [ ] 40 mails par IP et par jour au plus.
- [ ] 5 liens de connexion demandés par pseudo, puis 1 par l'adresse du même compte : il part (5 par heure et par forme d'identifiant, donc 10 au plus pour un compte).
- [ ] Répondre à un email de l'authentification (envoyé de `noreply`, sans adresse de réponse) : rien n'arrive nulle part ; Brevo accepte bien l'envoi sans adresse de réponse. Seuls l'accusé de réception et la notification du contact se répondent.
- [ ] Brevo refuse un email (adresse email invalide) : ni `error_log` ni `mailing_failure` ne contiennent l'adresse.
- [ ] Une seule place restante au quota, deux demandes de lien en même temps : les deux répondent pareil, l'échec éventuel est dans `mailing_failure`, rien ne casse.
- [ ] « Ta dernière connexion » (compte déjà inscrit) : « aujourd'hui », jours, semaines, mois et années justes, autour de minuit à Paris et d'un changement d'heure.
- [ ] Phrase « tu peux aussi saisir ce code sur la page restée ouverte » : juste dans chaque email à code, y compris le changement d'email et l'activation du facteur mail.
- [ ] Le bouton « Réinitialiser mon mot de passe » des notifications mène à la page `/auth/forgot-password`.
- [ ] Une fois connecté sans page demandée, retour au profil (`useAuthRedirect`).
- [ ] Tutoiement des emails face au vouvoiement du site (formulaire de contact, écran « Message envoyé », pages du pied de page) : décider d'harmoniser ou non.
- [ ] Aucun « mail » ni « adresse » seul pour l'email dans les textes visibles des interfaces et des emails : « email » et « adresse email » partout.

**Restauration, RGPD, sécurité**

- [ ] Restauration en `prod:local` d'un dump envoyé depuis le PC, sans date dans son nom : la date vient du dump, le journal est rejoué.
- [ ] Après une restauration : toutes les sessions et tous les parcours vidés, bandeau avec sa phrase « mot de passe oublié ».
- [ ] Purges : un parcours expiré disparaît en 15 minutes ; `auth_event` et `error_log` de plus de 20 jours, en un jour (horloge du serveur avancée en `prod:local`).
- [ ] `docker stop` du serveur juste après son démarrage (purges en cours) : aucune erreur de purge dans les logs ni dans `error_log`.
- [ ] Base arrêtée quelques minutes : une erreur par purge dans les logs, puis les purges reprennent seules quand la base revient, et le serveur ne s'arrête pas.
- [ ] « Données personnelles » : chaque point du §10.6, et un lien `contact@` qui marche.
- [ ] Aucun cookie posé avant la connexion, hors ceux de Cloudflare listés.
- [ ] Les nouvelles pages ne déclenchent aucune violation de CSP (console du navigateur).
- [ ] `docker logs site-prod-server` après une recette complète : aucun mot de passe, code, jeton ni lien.
- [ ] Pages de l'authentification sur mobile, en clair et en sombre, au clavier seul, et avec le zoom à 200 %.
- [ ] Changement d'email vers l'adresse actuelle (même en majuscules) : refusé tout de suite (`EMAIL_UNCHANGED`), aucun email.
- [ ] Suppression du compte avec une application : un code de secours faux, répété, finit en « trop d'essais » ; redonner le bon mot de passe entre deux erreurs de code n'efface pas le compte à rebours.
- [ ] À décider : un changement d'email confirmé doit-il fermer les autres sessions et annuler les « mot de passe oublié » en cours vers l'ancienne adresse ? Aujourd'hui non : il faut déjà le mot de passe pour le commencer, et l'ancienne adresse est prévenue après coup. À tester : lancer un « mot de passe oublié », changer l'email, puis finir le « mot de passe oublié » avec l'ancien email.
- [ ] À décider : le mail de notification du changement d'email pourrait partir à l'ancienne adresse dès la demande (et pas seulement après la confirmation), pour que son propriétaire puisse réagir avant.
- [ ] Session expirée pendant une modification du Backlog ou de GDC : aucun toast « Échec de … » par-dessus la connexion ; un autre compte connecté ensuite dans le même onglet ne voit rien du premier.
- [ ] Double clic sur l'ajout d'un jeu au backlog : un seul ajout, pas de 500.
- [ ] Deux comptes en même temps sur le Backlog : l'un retire un jeu pendant que l'autre en range un dans une nouvelle série ; aucun des deux n'attend ni n'échoue.
- [ ] Vider le Backlog depuis le profil, ou supprimer le compte, pendant qu'un autre onglet modifie un jeu : pas de 500, et aucune ligne du compte ne reste.
- [ ] Export : `backlog_series.csv` donne le nom de chaque série de `backlog_user_game.csv`, séries IGDB comprises.
- [ ] Edge : une seule icône d'œil dans les champs mot de passe (Edge ajoute la sienne à côté de la nôtre).
- [ ] Se déconnecter juste après une mort comptée dans GDC (requête lente) : avertissement ; « Annuler » garde la session. Sur téléphone, le header tient sur une ligne, profil et déconnexion en icônes.
- [ ] Journal de restauration : après un premier `citadel deploy`, `/Volume1/appdata/site-prod-server/restore-journal` appartient à 1000 en 700 ; un changement de mot de passe y écrit une ligne ; en `prod:local`, la même ligne dans le volume (`docker exec site-prod-server cat /var/lib/citadel/restore-journal/*.jsonl`).
- [ ] Journal impossible à écrire (dossier en lecture seule) : l'action échoue (500) et ne change rien ; l'erreur arrive dans `error_log`.
- [ ] En `prod:local` : restaurer une sauvegarde, créer un compte (il reprend l'identifiant d'un compte perdu), lui changer son email, puis restaurer le dump « avant-restauration » : le compte d'origine garde son email.
- [ ] Un code de secours utilisé pour se connecter, puis une restauration d'avant : il est refusé.
- [ ] Console du navigateur en `prod:local`, sur chaque page : aucune violation de la CSP, sauf `wasm-eval` sur Angers Irigo (sonde WebAssembly de `long.js`, sans effet).

## Annexe : fichiers du repo à relire

- `apps/admin/src/server/auth/` ; `apps/admin/src/server/http/writeAuditLog.ts` ; `packages/common/src/universal/cookie/`.
- `apps/server/src/` : `app.ts`, `globalRouter.ts`, `middleware/globalErrorHandler.ts`, `configuration/env.ts`, `error/`, `projects/errorLog/`, `sql/migrations/`.
- `packages/specs/src/specUtils/` : `apiPrefix.enum.ts`, `httpStatutCodeError.enum.ts`, `endpointModel.type.ts`, `error/`.
- `apps/client/src/` : `common/api/fetch/fetchHandler.ts`, `common/api/error/ApiError.ts`, `configuration/tanStackQueryClient.ts`, `react/appNavigation/`, `projects/homepage/components/Header/`, `projects/homepage/content/footerPages.ts`.
- `infra/Caddyfile`, `infra/compose.yml`, `infra/citadel`, `packages/eslint-config/eslintConfigCommon.js`.
- `docs/architecture.md` ; `docs/ci_cd/README.md` ; `docs/ci_cd/cahier_des_charges.md` (les mails).
