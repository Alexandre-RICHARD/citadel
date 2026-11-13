# Authentification

[Citadel](../../README.md) › Authentification

Comptes utilisateurs partagés entre tous les projets. Chaque utilisateur crée, modifie et supprime **ses** données sans jamais voir celles des autres. Aucun rôle, aucun privilège. Les mails (fournisseur, DNS, `contact@`, quota, IP réelle) sont décrits dans [mails](../mails/mails.md). Ce qui reste à faire est dans le [todo](../todo/todo.md#2-authentification).

## Sommaire

1. [Principes et périmètre](#1-principes-et-périmètre)
2. [Session et cookie](#2-session-et-cookie)
3. [Données](#3-données)
4. [Parcours](#4-parcours)
5. [Anti-abus et sécurité](#5-anti-abus-et-sécurité)
6. [Mails de l'authentification](#6-mails-de-lauthentification)
7. [Réglages et secrets](#7-réglages-et-secrets)
8. [RGPD, sauvegardes et restauration](#8-rgpd-sauvegardes-et-restauration)
9. [Organisation du code](#9-organisation-du-code)

## 1. Principes et périmètre

### 1.1 Principes

- **Aucun parcours perdu** : chaque mail propose un lien **et** un code ; recharger la page ou changer d'appli (boîte mail, gestionnaire de mots de passe) ne fait jamais perdre l'étape en cours.
- **Le serveur décide** : l'interface reflète les règles (délai, temps restant, mot de passe trop court), le serveur les impose.
- **Données minimales**, et rien de temporaire ou de supprimé au-delà de 3 mois (§8).
- **Zéro dépendance** quand c'est possible sans dette ni risque : tout est natif (`crypto`), sauf un petit générateur de QR code côté front. Sinon, une bibliothèque sobre pour un besoin précis, jamais un framework.
- **Code partagé avec la console d'administration** quand les deux en ont besoin (§9).
- **Un seul endroit pour les réglages** (§7).

### 1.2 Mise en place

L'authentification a été livrée d'un coup, sans version minimale, sur une branche dédiée fusionnée en gardant chaque commit. La prod ne contenait aucune donnée à garder : les colonnes `user_id` des projets sont obligatoires dès leur migration (V021, V022), et les jeux existants sont partis à ce moment-là. L'inscription est ouverte dès la mise en prod.

### 1.3 Hors périmètre

- Fournisseurs externes (Google, GitHub…), passkeys / WebAuthn, fournisseur d'identité hébergé (Keycloak…).
- Rôles et privilèges.
- Récupération d'un compte dont on a perdu l'email **et** le mot de passe : aucune solution satisfaisante. Ni adresse de secours, ni clé de récupération.
- Refus des mots de passe courants : l'utilisateur est responsable de son mot de passe, et les conseils affichés l'y invitent.
- Actions de la console d'administration sur les comptes.

## 2. Session et cookie

### 2.1 Fonctionnement

Session opaque en base :

```
Connexion    serveur : vérifie le hash, tire 32 octets aléatoires (le jeton),
             crée une ligne auth_session avec SHA-256(jeton), pose le cookie
Requête      SHA-256(cookie) → ligne → expiration → prolonge si besoin → utilisateur
Déconnexion  ligne supprimée : le jeton ne marche plus, immédiatement
```

Le jeton est en `base64url`. En base, seulement son SHA-256 : une fuite de la base ne donne aucune session.

### 2.2 Cookie

| Attribut | Valeur |
|---|---|
| Nom | `__Host-citadel_session` ; `citadel_session` quand `Secure` est désactivé (le préfixe l'exige) |
| `HttpOnly` | oui |
| `Secure` | oui ; désactivable en dev (`AUTH_COOKIE_SECURE`) |
| `SameSite` | `Lax` : un `GET` ne modifie jamais rien |
| `Path` / `Domain` | `/` / absent |
| `Max-Age` | avec « se souvenir de moi » seulement |

CSRF : `SameSite=Lax`, mutations en `POST`/`PATCH`/`DELETE`, contrôle de l'en-tête `Origin` sur les requêtes non sûres. Un autre hôte → `403` `FOREIGN_ORIGIN`. Absent, il est accepté : un navigateur l'envoie toujours sur ces requêtes, alors que la console et les jobs du NAS ne l'envoient pas.

### 2.3 Durées

- **Avec « se souvenir de moi »** : 7 jours après la dernière action. Si `last_seen_at` date de plus de 5 minutes, le serveur le met à jour, repousse `expires_at` et renvoie le cookie.
- **Sans** : cookie sans `Max-Age`, effacé à la fermeture du navigateur, et 12 h d'inactivité au plus côté serveur. Les navigateurs qui rouvrent les onglets au démarrage, et les navigateurs mobiles qu'on ne ferme jamais vraiment, gardent ce cookie : la limite de 12 h s'applique alors.
- **Plafond absolu** : 30 jours après la connexion, même en restant actif.
- Sous la case « Se souvenir de moi », à la connexion et à l'inscription : « Reste connecté 7 jours sans visite, 30 jours au plus » ; la liste des sessions affiche la fin de chacune.
- Les sessions expirées sont refusées à la lecture et supprimées par la purge du serveur (§4.1).

## 3. Données

### 3.1 Tables des projets

| Table | Lien avec l'utilisateur |
|---|---|
| `gdc_game` | `user_id` obligatoire, clé étrangère `ON DELETE CASCADE` vers `auth_user` |
| `gdc_boss`, `gdc_death` | Propriété vérifiée par jointure jusqu'à `gdc_game` ; cascade |
| `backlog_user_game` | `user_id` ; clé primaire `(user_id, game_id)` ; cascade |
| `backlog_user_version` | `user_id` ; unicité `(user_id, version_id, platform_id)` ; cascade |
| `backlog_done_dlc` | Cascade par sa version jouée |
| `backlog_series` | `user_id` nullable : vide pour une série IGDB commune, rempli pour une série créée à la main ; un `CHECK` l'impose |
| Tables IGDB (`backlog_game`, `backlog_version`, `backlog_version_platform`, `backlog_dlc`, `backlog_company`, `backlog_platform`) | Données communes, aucun lien |

Un jeu du backlog ne se range que dans une série IGDB ou une série de son propriétaire ; « Nouvelle série… » ne retrouve un nom que parmi celles-là. Un jeu en base (données IGDB) est à tous : celui du backlog d'un autre reste proposé par « Ajouter un jeu depuis la Citadel ».

Les données du Backlog d'un utilisateur (suppression du compte ou du projet) sont supprimées par le serveur, dans une transaction, enfants d'abord : `backlog_user_game`, `backlog_user_version`, puis ses séries. `backlog_user_game.series_id` est en `RESTRICT` et son `CHECK` interdit `SET NULL` : l'ordre des cascades ne doit rien décider.

### 3.2 Tables de l'auth

Toutes s'appellent `auth_*` (un préfixe par sujet : `gdc_`, `backlog_`, `mailing_`, `auth_`), sont en InnoDB `utf8mb4`, avec `created_at` et `updated_at` en `DATETIME(3)`. Toute table liée à un utilisateur a une clé étrangère `ON DELETE CASCADE` vers `auth_user`. Migrations V014 à V020.

| Table | Contenu |
|---|---|
| `auth_user` | `email` (unique, tel que saisi, sans espace), `username` (unique, définitif), `display_name` (nul = `username`), `password_hash`, `password_changed_at`, `login_methods` (`mail`, `password`, `both`), `last_login_at`, `last_seen_at` |
| `auth_session` | `token_hash` (BINARY(32), unique), `remember`, `user_agent` (tronqué à 255 caractères), `ip` (tronquée : `/24` en IPv4, `/48` en IPv6), `last_seen_at`, `expires_at`, `absolute_expires_at` |
| `auth_flow` | Tout parcours en plusieurs étapes (§4.1) : `token_hash`, `kind` (`registration`, `login`, `mail_login`, `password_reset`, `email_change`, `email_factor`), `step` (`mail_code`, `second_factor`, `new_password` ; un `CHECK` n'accepte que les étapes du parcours), `user_id` (nul pour une inscription), `email`, `payload` JSON (inscription : `username`, `passwordHash` ; changement d'email : `newEmail`), `code_hmac`, `link_token_hash`, `attempts`, `send_count`, `remember`, `last_sent_at`, `expires_at` |
| `auth_factor` | Facteurs 2FA : `type` (`email`, `totp`), `name`, `secret_encrypted`, `key_version`, `last_used_step` (un INT suffit jusqu'à l'an 4000, un BIGINT arriverait en chaîne), `last_used_at`, `confirmed_at` (nul tant que le premier code n'est pas validé : facteur inactif, purgé après 15 minutes). Un seul facteur `email` par compte |
| `auth_recovery_code` | `code_hash`, `used_at` |
| `auth_event` | `user_id` (nul), `type` (texte libre : un nouveau type sans migration), `ip` (tronquée), `user_agent`. Purge à 20 jours |

### 3.3 Collations et types

- Empreintes en `BINARY(32)` : comparaison octet par octet.
- **Email** : `utf8mb4_uca1400_as_ci`, comme les messageries : la casse ne compte pas (`Alex@…` et `alex@…` sont la même adresse), les accents oui (`josé@…` et `jose@…` sont deux adresses, RFC 6531). Le mail part à l'adresse telle que saisie. La collation confond `ａ` (pleine chasse) et `a`, `ﬁ` et `fi`, et ignore les caractères invisibles : la règle de format de l'email les refuse.
- **Pseudo** : `utf8mb4_bin`, toute différence de caractère compte : `Alex` et `alex` peuvent coexister.
- Les autres tables gardent la collation de la base, qui ignore casse **et** accents (chercher « pokemon » trouve « Pokémon ») : seules les colonnes de l'auth sont réglées une par une, sans migration globale.

## 4. Parcours

### 4.1 Commun à tous les parcours

- **`auth_flow` + cookie de parcours** : tout parcours en plusieurs étapes (inscription, connexion avec 2FA, connexion par mail, mot de passe oublié, changement d'email, activation du facteur mail) a une ligne `auth_flow` et un cookie `HttpOnly` dédié, `__Host-citadel_flow` (même règle de préfixe que la session, `SameSite=Lax`, `Path=/`, `Max-Age` = durée du parcours). Un parcours par navigateur : en commencer un autre supprime le précédent.
- **Reprise** : une page `/auth/...` demande au serveur s'il y a un parcours en cours et se replace à la bonne étape. Les champs tapés (sauf les mots de passe) sont gardés dans le `sessionStorage` de l'onglet. Au retour sur l'onglet (`visibilitychange`), le front redemande l'état : si le lien a été ouvert dans un autre onglet du même navigateur, la page passe d'elle-même à la suite.
- **Lien et code dans chaque mail** :
  - le **code** (6 chiffres, empreinte HMAC, usage unique, invalidé par un renvoi, qui remet les essais à zéro) se colle dans la page restée ouverte, y compris sur un autre appareil ;
  - le **lien** (jeton de 32 octets, haché) ne marche que dans le navigateur qui a commencé le parcours. Ailleurs, la page dit d'utiliser le code (`LINK_OTHER_BROWSER`) : sinon, un attaquant lance une connexion avec ton email, tu cliques, et c'est son navigateur qui est connecté. Le jeton voyage dans le fragment (`/auth/verify#…`), jamais envoyé à un serveur ni écrit dans un journal ;
  - la page d'arrivée du lien (`/auth/verify`) demande un clic de confirmation (`POST`) : les antivirus de messagerie ouvrent les liens pour les analyser.
- **Temps restant** : chaque réponse renvoie `expiresIn` et, pendant le délai de renvoi, `resendRetryAfter`, en secondes (jamais une date : l'horloge du navigateur peut différer), et les essais restants.
- **Parcours leurre** : connexion par mail et mot de passe oublié d'un identifiant inconnu (ou d'une méthode fermée) créent un parcours sans compte ni code (V020), comme une inscription au champ piège rempli : même cookie, même état, mêmes limites, aucun mail.
- **Expiration** : un parcours expiré est refusé à la lecture. Une minuterie du serveur (`purge/`) supprime toutes les 15 minutes les lignes expirées (`auth_flow`, `auth_session`) et les facteurs non confirmés depuis plus de 15 minutes, et une fois par jour les vieilles lignes de `auth_event` et `error_log`.
- **Réponses neutres** : rien ne dit si un email existe, ni par le contenu, ni par la durée (mail envoyé après la réponse, §6).
- Chaque étape répond `{ flow }` : l'état du parcours (à l'étape « second facteur », ses `secondFactorMethods`), ou `null` quand il est terminé (session ouverte, ou facteur mail activé avec ses `recoveryCodes`).

### 4.2 Inscription

1. **Formulaire** : email, pseudo, mot de passe, confirmation, case « Se souvenir de moi ».
   - Pseudo : 1 à 64 caractères parmi `A-Z`, `a-z`, `0-9`, `_` et `-`, définitif. Le pseudo affiché est libre : 1 à 64 caractères, accents, espaces et symboles compris, normalisé en NFC, espaces de bord retirés, espaces consécutifs réduits à un, ni caractère de contrôle ni caractère invisible. Bouton « Vérifier la disponibilité » à côté du champ.
   - Mot de passe : barre de force, conditions qui passent au vert en direct, icône œil pour afficher ou masquer les deux champs.
   - Messages : les 30 minutes pour terminer, et le conseil d'un mot de passe différent par site, avec un gestionnaire de mots de passe.
2. **Serveur** : inscriptions fermées par l'interrupteur (`AUTH_REGISTRATION_ENABLED`) ou le quota de mails (`MAIL_REGISTRATION_STOP`) → `403` `REGISTRATION_CLOSED` (le front le sait par `GET /mail/status` : bouton désactivé, bandeau « …elles rouvrent demain. »). Pseudo pris → `409` `USERNAME_TAKEN`. Sinon, création d'un `auth_flow` `registration` ; réponse toujours « un email t'a été envoyé ».
3. **Mail** : adresse nouvelle → « Confirme ton inscription » + lien + code ; adresse déjà inscrite → « Tu as déjà un compte, dernière connexion il y a… » + lien vers la connexion, sans code. Durée floue : aujourd'hui, puis 1 à 7 jours, 1 à 5 semaines, 1 à 12 mois, puis en années.
4. **Code ou lien validé** : création de `auth_user` (pseudo revérifié), suppression du parcours, session ouverte. Pseudo pris entre-temps : `409`, le parcours reste ouvert et la page redemande un pseudo (`code` et `link` acceptent un `username` de remplacement).
5. **Étape facultative** : « Protège ton compte » (2FA), puis retour à la page demandée au départ.

Une nouvelle inscription avec la même adresse remplace le parcours en attente : la personne qui reçoit les mails gagne toujours. Il y a 30 minutes pour terminer.

### 4.3 Mots de passe

- **Règles** (specs, partagées avec le front) : 12 à 128 caractères, aucune règle de composition. Normalisé en NFC (front et serveur) avant le contrôle de longueur et le hash.
- **Barre de force** : petite fonction sans bibliothèque (longueur, variété, répétitions, suites, rangées de clavier). Indicative, elle ne bloque rien. Un « ? » explique sa limite : elle surestime un mot du dictionnaire maquillé (`P@ssw0rd!`).
- **Jamais le même** : changer son mot de passe (profil ou mot de passe oublié) pour l'actuel est refusé (`400` `PASSWORD_UNCHANGED`).
- **Hash** : `argon2id` natif, asynchrone, minimum OWASP (19 Mio, 2 passes, parallélisme 1) ; 2 hashs simultanés au plus, 20 en attente au plus ; au-delà, `503` `AUTH_BUSY` + `Retry-After` (le serveur n'a que 256 Mo).
- **Format auto-descriptif** : algorithme et paramètres dans la chaîne stockée, séparés par `:`, sans `$` (la console garde son hash dans `.env.prod`). Si les paramètres montent, chaque mot de passe est refait à la connexion suivante de son propriétaire, seul moment où le serveur le connaît ; les anciens hashs restent valables d'ici là.
- **Comparaison à temps constant** ; **hash factice** pour un identifiant inconnu (même délai qu'un mauvais mot de passe).

### 4.4 Connexion

- **Page** : identifiant (email ou pseudo ; un pseudo ne contient jamais `@`), mot de passe, « Se souvenir de moi », « Recevoir un lien de connexion par email », « Mot de passe oublié ».
- **Par mot de passe** : sans 2FA, session immédiate. Avec 2FA, parcours `login` à l'étape `second_factor` : TOTP, code reçu par mail ou code de secours. Aucune session avant la fin.
- **Par mail** : mail (lien + code), puis TOTP ou code de secours si un TOTP existe : le mail remplace le mot de passe, jamais le TOTP. Le code par mail n'y est jamais proposé en second facteur, la boîte vient d'être prouvée. Si le seul facteur est le mail, rien de plus : il ne protège que d'un mot de passe volé.
- **Méthodes** : choisies dans le profil (par email / par pseudo et mot de passe / les deux, défaut : les deux). Une méthode fermée répond comme un échec ordinaire : `401` `INVALID_CREDENTIALS` pour le mot de passe, réponse neutre sans mail pour le lien. Avec « par email » seulement, le mot de passe reste exigé pour les actions sensibles ; oublié, il se refait par « Mot de passe oublié », toujours ouvert.
- **Échec** : même message pour un identifiant inconnu et un mauvais mot de passe (`401` `INVALID_CREDENTIALS`).
- **Déjà connecté** : la page redirige vers le profil ou la page demandée ; une nouvelle connexion dans le même navigateur supprime l'ancienne session.

### 4.5 Mot de passe oublié

Email ou pseudo → réponse neutre → mail (lien + code) à l'adresse du compte, jamais affichée → TOTP ou code de secours si un TOTP existe, jamais le code par mail (comme GitHub, et comme le recommande OWASP : sinon, une boîte mail compromise suffirait à contourner la 2FA) → nouveau mot de passe, deux fois, différent de l'actuel → toutes les sessions supprimées → connecté.

### 4.6 Profil

Page `/auth/profile` :

- **Identité** : pseudo (définitif), pseudo affiché (modifiable, vide = pseudo), email.
- **Email** : mot de passe, puis lien + code à la **nouvelle** adresse ; remplacement après validation ; notification à l'ancienne. Même adresse (même en majuscules) : `400` `EMAIL_UNCHANGED`. Adresse déjà inscrite : même réponse, et le mail à cette adresse dit qu'un autre compte a voulu la prendre, sans lien ni code. Prise entre-temps : `409` `EMAIL_TAKEN`.
- **Mot de passe** : ancien + nouveau deux fois ; toutes les autres sessions supprimées.
- **Sécurité** : facteurs 2FA, codes de secours, méthodes de connexion.
- **Sessions actives** (§4.8) et **Mes données** (§4.9).
- **Actions sensibles** (mot de passe, email, suppression d'un facteur, régénération des codes de secours, suppression de données ou du compte) : mot de passe redemandé, et second facteur en plus pour supprimer le compte. Faux, il répond `400` `WRONG_PASSWORD`, pas `401`, qui voudrait dire « plus de session » ; ses échecs comptent comme ceux de la connexion.

### 4.7 Double authentification

- **Par mail** : un code (+ lien) après le mot de passe, envoyé à la demande (`POST /auth/flow/resend` à l'étape « second facteur »). Activation confirmée par un premier code (parcours `email_factor`, 15 minutes), sans nouvelle session.
- **TOTP** : secret généré par le serveur ; QR code (`otpauth://`, émetteur « Citadel », email en libellé) généré **dans le navigateur**, plus la clé à saisir à la main. Plusieurs facteurs nommés possibles ; activation après un premier code valide. SHA-1, 6 chiffres, 30 s, ±1 pas. Anti-rejeu : un code accepté ne resservira pas, même pendant ses 30 à 90 secondes de validité. Secret chiffré en AES-256-GCM, avec la version de la clé et l'identifiant du facteur en donnée associée. Rotation : nouvelle clé et nouvelle version, l'ancienne dans `AUTH_TOTP_PREVIOUS_ENCRYPTION_KEY` ; chaque secret est rechiffré à son prochain usage.
- **Codes de secours** : la roue de secours du second facteur (téléphone perdu, boîte mail inaccessible). Générés à l'activation du premier facteur, quel que soit son type ; 10 codes à usage unique de 10 caractères en Base32 (deux groupes de 5), gardés en HMAC avec `AUTH_CODE_HMAC_KEY` : leurs 50 bits résisteraient mal à une recherche hors ligne sur un simple hash. Donnés par la réponse qui active le premier facteur, affichés une seule fois, avec téléchargement en texte. Régénérables avec le mot de passe (les anciens sont invalidés) ; le profil affiche le nombre restant.
- **Gestion** : liste (nom, type, création, dernier usage), ajout, suppression confirmée par le mot de passe. Supprimer le dernier facteur désactive la 2FA et supprime les codes de secours.

### 4.8 Sessions actives et déconnexion

- Liste : navigateur et système (déduits du user agent), dernière activité, création, fin prévue, IP tronquée, « cette session ». Actions : déconnecter une session, tout, tout sauf ici.
- **Déconnexion** : sans confirmation, sauf s'il reste des mutations en cours ou un formulaire modifié (`useBlocker`). Le cache de TanStack Query est vidé. Dans les autres onglets, le prochain appel reçoit un `401` et renvoie vers `/auth/login`.
- Une session d'un autre compte, ou qui n'existe plus : `404` `SESSION_NOT_FOUND`. Se déconnecter de la session en cours, ou de toutes, efface aussi le cookie.

### 4.9 Suppression et export

- **Suppression du compte** : mot de passe, plus un code de l'application d'authentification (ou un code de secours) si le compte en a une (`400` `SECOND_FACTOR_REQUIRED` sinon). Jamais le code par email : il demanderait un mail de plus, et un compte qui n'a que ce facteur n'en doit pas, comme à la connexion par email. Immédiate et définitive, tout part par cascade ; mail de confirmation. Les sauvegardes l'oublient en 3 mois au plus.
- **Suppression des données d'un projet** : une case par projet, mot de passe ; le compte reste. `DELETE /auth/me/projects` vide en une fois les projets de sa liste (`game-death-counter`, `backlog`).
- **Export** : « Télécharger mes données » (`GET`, le cookie suffit) → un ZIP avec un CSV par table, toutes les lignes de l'utilisateur, sans aucun secret (ni hash, ni empreinte, ni secret TOTP). ZIP sans compression, fait sans bibliothèque.

### 4.10 Dans l'interface

- **Homepage** : le bouton « Se connecter » du header mène à `/auth/login`. Connecté : icône + pseudo affiché (vers le profil) et bouton « Se déconnecter ».
- **Backlog et Game Death Counter** : une petite icône de profil.
- Le projet `auth` n'apparaît ni dans la roue ni dans le pied de page.

### 4.11 Protection des endpoints et des projets

- `protected` (specs) est lu par le routeur typé du serveur : `true` → session exigée (`401` sinon), et le contrôleur reçoit l'identifiant de l'utilisateur.
- Chaque service et chaque requête sur une table d'utilisateur filtre par `user_id`, qui vient toujours de la session, jamais du corps. La ressource d'un autre utilisateur répond `404`.
- **Accès des projets** (`ProjectDictionary`) : Homepage, Satisfactory et Angers Irigo publics ; Game Death Counter et Backlog privés, tous leurs endpoints `protected` (IGDB compris : son quota est partagé par tous les inscrits). Un visiteur non connecté est renvoyé vers `/auth/login?redirect=…`, puis ramené.
- **État connecté** : `useQuery` sur `GET /auth/me` (clé `["auth", "me"]`, `staleTime` 30 s). Un `401` `AUTHENTICATION_REQUIRED` sur toute autre requête vide le cache et redirige vers la connexion ; jamais `INVALID_CREDENTIALS`, qui reste une erreur de formulaire.

### 4.12 Endpoints

Préfixe `/auth` (`ApiPrefixEnum`).

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
| `GET /auth/sessions`, `DELETE /auth/sessions/:sessionId`, `DELETE /auth/sessions`, `DELETE /auth/sessions/others` | Sessions ; tout ; tout sauf ici |
| `GET /auth/factors`, `POST /auth/factors/totp`, `POST /auth/factors/totp/confirm`, `POST /auth/factors/email`, `DELETE /auth/factors/:factorId` | 2FA |
| `POST /auth/recovery-codes` | Régénérer les codes de secours |
| `GET /auth/me/export`, `DELETE /auth/me/projects`, `DELETE /auth/me` | Export, suppressions (mot de passe dans le corps, plus le code TOTP pour le compte) |

Erreurs : `401` (`AUTHENTICATION_REQUIRED`, `INVALID_CREDENTIALS`), `403` (`REGISTRATION_CLOSED`, `MAIL_CLOSED`), `400` (`PASSWORD_UNCHANGED`, `EMAIL_UNCHANGED`, `INVALID_CODE`, `CODE_ATTEMPTS_EXHAUSTED`, `LINK_OTHER_BROWSER`, `FLOW_EXPIRED`, `WRONG_PASSWORD`, `NO_SECOND_FACTOR`, `SECOND_FACTOR_REQUIRED`), `404` (`FACTOR_NOT_FOUND`, `SESSION_NOT_FOUND`), `409` (`USERNAME_TAKEN`, `EMAIL_TAKEN`, `EMAIL_FACTOR_ALREADY_ACTIVE`), `429` (`TOO_MANY_ATTEMPTS` + `Retry-After`), `503` (`AUTH_BUSY` + `Retry-After`).

## 5. Anti-abus et sécurité

### 5.1 Menaces et parades

| Menace | Parade |
|---|---|
| Brute force sur un compte | 2 s entre deux essais, bannissement temporaire après 15 échecs, second facteur compris |
| Un mot de passe essayé sur beaucoup de comptes | Compteur par IP, puis bannissement temporaire |
| Verrouillage malveillant d'un compte | Délai et bannissement visent le couple compte + IP : un inconnu ne bloque pas ton compte |
| Énumération des comptes | Réponses et délais identiques (mails envoyés après la réponse), hash factice, inscription et mot de passe oublié neutres. Les pseudos sont publics par nature |
| Spam d'inscriptions | Limite par IP, parcours purgés, champ piège caché (honeypot) |
| Spam de mails, quota épuisé | Délai de renvoi, limites par adresse ou identifiant tapé et par IP (20 par heure, 40 par jour), seuils du quota ([mails, §2](../mails/mails.md#2-envoi)). L'adresse tapée compte en minuscules, car les messageries ignorent la casse ; jamais l'email trouvé depuis un pseudo, qui lierait les deux |
| Rejeu d'un code ou d'un lien | Usage unique, durée courte, essais limités, lien lié au navigateur |
| Lien de connexion détourné | Lien lié au navigateur, clic de confirmation. Brevo voit passer les liens qu'il réécrit, sans effet pour la même raison |
| Vol de session | Cookie `HttpOnly`/`Secure`, CSP, sessions révocables |
| CSRF | `SameSite=Lax`, `Origin`, `GET` sans effet |
| Quota d'IGDB partagé | Endpoints IGDB réservés aux connectés |

Les limiteurs visent le compte trouvé, pas le texte tapé : alterner email et pseudo ne double pas les essais. Risque accepté (3 novembre 2026) : un échec par pseudo puis un essai immédiat par une adresse devinée montre le compte à rebours si les deux vont ensemble ; il faut déjà connaître le pseudo et deviner l'adresse exacte.

### 5.2 Délai et bannissement

- Succès : immédiat, compteur remis à zéro. Échec : `401`, puis aucun nouvel essai sur ce compte depuis cette IP avant 2 s. Après 15 échecs depuis la même IP sur le même compte : 15 minutes de `429` pour ce couple. Compteur remis à zéro après un succès ou 15 minutes de calme. Pendant un délai : `429` + `Retry-After` ; bouton désactivé avec compte à rebours.
- Les échecs de l'étape « second facteur » (TOTP, code par mail, code de secours) comptent comme ceux du mot de passe, pour le compte et pour l'IP : relancer des connexions ne donne pas d'essais en plus.
- Bannissement d'IP : 20 échecs en 10 minutes ou plus de 3 inscriptions par heure → 15 minutes de `429`. En IPv6, il vise le `/64`.
- L'IP est celle que Caddy a validée ([mails, §6](../mails/mails.md#6-côté-serveur)) : sans elle, tous les visiteurs auraient la même.
- Compteurs en mémoire (une seule instance), remis à zéro à chaque déploiement.

### 5.3 Détection et journaux

- `auth_event` : échecs (`login_failed`, `second_factor_failed`…), inscriptions, parcours jamais confirmés, connexions, ajouts et suppressions de 2FA, changements de mot de passe ou d'email. Réponses proportionnées : bannissement temporaire, journal, notifications par mail. Pas de blocage définitif automatique.
- Jamais de mot de passe, jeton, code, lien ni secret TOTP dans un log, un message d'erreur ou `error_log` ; aucune requête d'auth loguée avec son corps.

## 6. Mails de l'authentification

- **Après la réponse** : les mails des réponses neutres (inscription, connexion par mail, mot de passe oublié, changement d'email) partent une fois la réponse envoyée, sans être attendus. Ni la durée ni un échec ne disent si le compte existe ; un échec va dans `mailing_failure` et les logs, jamais au visiteur.
- **Quota épuisé** : connexion par mail, mot de passe oublié, changement d'email et activation du facteur mail répondent `403` `MAIL_CLOSED` (« Plus aucun email ne part aujourd'hui, réessaie demain. »), pour tout le monde. À l'étape « second facteur », le code par mail est grisé ; TOTP et codes de secours restent.
- **Gabarits** : HTML et texte brut, en français, en tutoiement, mise en page de `buildMailBodies`, plusieurs phrases de vrai texte (délivrabilité), lien, durée de validité, « si tu n'es pas à l'origine de cette demande, ignore cet email ». Chaque gabarit a son type (`MailKindEnum`) et sa story dans le Storybook ([mails, §6](../mails/mails.md#6-côté-serveur)). Les mails de sécurité renvoient vers `contact@` en cas de doute.

| Mail | Contenu |
|---|---|
| Inscription, adresse nouvelle | Lien + code |
| Inscription, adresse déjà inscrite | « Tu as déjà un compte, dernière connexion il y a… », lien vers la connexion |
| Mot de passe oublié, connexion par mail | Lien + code |
| Second facteur par mail, activation du facteur mail | Code + lien |
| Changement d'email | Lien + code à la nouvelle adresse ; notification à l'ancienne. Adresse déjà inscrite : « un autre compte a voulu prendre cette adresse email », sans lien ni code |
| Notifications | Mot de passe changé, email changé, 2FA ajoutée ou retirée, compte supprimé |

## 7. Réglages et secrets

Toutes les durées et tous les seuils sont des variables d'environnement, déclarées une seule fois dans la section `auth` de `env.ts` (zod), avec leur valeur par défaut : ajustables sans release. Le code n'y accède que par `authSettings`. `.env.example` les liste toutes ; `.env.test` raccourcit les durées utiles aux tests. Le front ne les connaît pas : le serveur lui renvoie les durées restantes. Les règles de format (longueurs du mot de passe, de l'email, du pseudo, du code) vivent dans les schémas zod de `packages/specs`.

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

Les variables des mails (`MAIL_*`, `CONTACT_HOURLY_LIMIT_PER_IP`, `BREVO_*`) sont dans [mails, §6](../mails/mails.md#6-côté-serveur).

**Secrets** (`.env.prod` + Bitwarden, créés avant d'être écrits) : `AUTH_CODE_HMAC_KEY` ; `AUTH_TOTP_ENCRYPTION_KEY` et sa version (`AUTH_TOTP_ENCRYPTION_KEY_VERSION`) ; `AUTH_TOTP_PREVIOUS_ENCRYPTION_KEY`, vide hors rotation. `pnpm tools generateAuthSecrets` les génère. Le serveur refuse de démarrer, en nommant la variable fautive, si une clé manque ou n'a pas 64 caractères hexadécimaux, ou si une clé précédente est donnée sans être différente de l'actuelle avec une version d'au moins 2. Chaque variable va dans `.env.example` (`[secret]` devant chaque secret) et dans `infra/compose.yml` (`site-prod-server`) ; `prod:local` reçoit des clés factices.

La console d'administration utilise le même `argon2id` : `ADMIN_PASSWORD_HASH` se génère par `citadel admin-password` (dans l'image) ou `pnpm tools hashAdminPassword`. Un ancien hash `scrypt` l'empêche de démarrer, avec un message qui dit quoi faire.

## 8. RGPD, sauvegardes et restauration

### 8.1 La règle des 3 mois

Aucune donnée personnelle temporaire ou supprimée ne survit plus de **3 mois**, où qu'elle soit (base, journaux, sauvegardes). Le reste vit tant que le compte existe.

| Donnée | Durée |
|---|---|
| Email, pseudo, pseudo affiché, hash du mot de passe, dates de connexion, facteurs 2FA, codes de secours, données des projets | Tant que le compte existe |
| Sessions (empreinte, user agent, IP tronquée, dates) | 30 jours au plus, puis purge |
| Parcours (`auth_flow`) | Quelques minutes, puis purge |
| `auth_event` (IP tronquée), `error_log` | 20 jours : avec les 10 semaines des sauvegardes, moins de 3 mois |
| Logs de Caddy et des conteneurs | 90 jours (job `log-retention`) |
| Sauvegardes de la base | Moins de 10 semaines |
| Journal de restauration (§8.3) | 10 semaines, l'âge de la plus vieille sauvegarde |
| Mails chez Brevo (adresse, objet, ouvertures) | 1 mois (« Retention rules » réglée dans son compte) |

Les fichiers dérivés (historiques déposés pour la console) suivent la même règle. Principes : minimisation (ni nom ni prénom) ; suppression réelle ; accès et portabilité par l'export ; aucun traceur au-delà du strictement nécessaire.

### 8.2 Cookies et stockage du navigateur

Les lignes directrices de la CNIL (délibération n° 2020-091) dispensent de consentement les traceurs strictement nécessaires à un service demandé par l'utilisateur (authentification et sa sécurité, personnalisation d'interface choisie). Ce que le site dépose :

| Traceur | Rôle |
|---|---|
| Cookie de session | Authentification (persistant seulement si « se souvenir de moi » est coché) |
| Cookie de parcours | Étape en cours d'une inscription, d'une connexion, etc. |
| `localStorage` : thème, favoris et réglages d'Angers Irigo, colonnes du Backlog, bandeau du site fermé | Choix d'interface |
| `sessionStorage` : champs d'un parcours en cours ; intro déjà vue | Reprise après rechargement ; intro jouée une fois par session |
| Pixel d'ouverture de Brevo dans les mails (« suivi anonyme ») | Statistiques d'envoi du fournisseur |

Tous sont dispensés de bandeau, à condition d'être décrits dans « Données personnelles ». Décision : le pixel de Brevo ne se désactive pas sur l'offre gratuite, et Brevo reste le meilleur choix d'envoi ; le site l'indique tel quel. C'est un écart assumé avec la recommandation CNIL du 12 mars 2026, qui ne dispense que le pixel limité à la date de dernière ouverture.

### 8.3 Sauvegardes et restauration

- **Rétention** (`infra/citadel`) : base, chaque jour : 14 jours + 4 dimanches + 2 premiers dimanches du mois ; dumps « avant déploiement » : les 2 derniers, 30 jours au plus. La plus vieille a moins de 10 semaines.
- **Restauration** (`citadel restore-db` ou la zone de danger de la console) : juste après l'import, serveur encore arrêté (aucune requête ne passe avec une session ressuscitée), la commande « après restauration » du serveur (`build/afterRestore.cjs`, second point d'entrée de son image) tourne dans un conteneur jetable. Elle reçoit la date de la sauvegarde : son nom, sinon la ligne `-- Dump completed on` du dump, lue à l'heure de Paris, moins une heure, puisqu'elle marque la fin du dump (un dump envoyé depuis le PC n'a pas forcément de date dans son nom). En échec, le serveur reste arrêté. Elle :
  - **rejoue le journal** après cette date : suppressions refaites, changements d'email remis ; un compte qui a changé sa sécurité voit son mot de passe invalidé (à refaire par « Mot de passe oublié ») ;
  - **vide toutes les sessions et tous les parcours**, sinon une session révoquée après la sauvegarde redevient valide.
- **Journal de restauration** : lignes JSON (identifiant et pseudo du compte, action, date ; nouvelle adresse pour un changement d'email, projets vidés, empreinte d'un code de secours utilisé) pour chaque suppression de compte ou de données d'un projet, changement d'email, changement de sécurité (mot de passe, facteur, codes de secours) et code de secours utilisé. Écrites en dernière étape de la transaction : une ligne qui ne s'écrit pas annule l'action. Le rejeu ne touche qu'un compte de même identifiant **et** de même pseudo, car une restauration redonne des identifiants à d'autres comptes. Un fichier par jour (UTC), effacé quand son dernier instant a 10 semaines.
- **Où vit le journal** : hors de la base, sinon il serait restauré avec elle. Dans `/Volume1/appdata/site-prod-server/restore-journal/` (créé par `citadel deploy`, à l'utilisateur 1000, en 700), exclu de `config-backup` : une archive de 2 mois y garderait des adresses plus de 3 mois. Sans sauvegarde, la perte du disque ne coûte que le rejeu des dernières semaines.
- **Bandeau** : le message automatique de restauration invite à passer par « Mot de passe oublié » si le mot de passe ou la 2FA a changé pendant la période perdue. Il vouvoie, comme le site.

### 8.4 La page Données personnelles

Responsable du traitement (joignable par `contact@`) ; données des comptes, finalités et bases légales (exécution du service ; intérêt légitime pour la sécurité et les journaux) ; durées et règle des 3 mois ; IP tronquées ; sauvegardes ; sous-traitants (Brevo, en France ; Cloudflare, aux États-Unis, sous le cadre de transfert UE–États-Unis) ; droits (export et suppression en libre-service, plus `contact@`) et réclamation auprès de la CNIL ; cookies, stockage et pixel. Pas de conditions d'utilisation pour l'instant.

## 9. Organisation du code

Un projet comme les autres, mais que tous les autres utilisent : leurs endpoints sont `protected`, et chaque table de projet porte un `user_id`.

| Couche | Emplacement | Contenu |
|---|---|---|
| Specs | `packages/specs/src/projects/auth/` | Registre d'endpoints, `endpoint/<ressource>/<action>/`, `error/authErrorCode.enum.ts`, règles de format |
| Specs communes | `packages/specs/src/specUtils/` | `ApiPrefixEnum.AUTH`, `429`, `protected` lu par le serveur, `AUTHENTICATION_REQUIRED` (le `401` de tout endpoint protégé) |
| Serveur | `apps/server/src/projects/auth/` | Voir ci-dessous |
| Serveur, transverse | `middleware/`, `error/`, `configuration/`, `purge/` | `requireSession`, `realClientIp`, `requireSameOrigin` ; erreurs 401, 403, 429 ; `env.ts` et `authSettings` ; purges |
| Migrations | `apps/server/src/sql/migrations/` (V013 à V022) | Tables `mailing_*` renommées, tables `auth_*`, `user_id` des projets |
| Front | `apps/client/src/projects/auth/` | `/auth/login`, `/auth/register`, `/auth/forgot-password`, `/auth/verify`, `/auth/profile`, `/auth/secure-account` (étape facultative après l'inscription) ; `useMe` ; `authErrorReasons.ts`, `authFieldLabels.ts` |
| Front, transverse | `react/appNavigation/`, homepage, Backlog, GDC | `ProjectsEnum.Auth`, accès de chaque projet, gestion du `401`, bouton du header, icône de profil |

**Serveur** (`projects/auth/`) :

- `service/` porte les règles : un service par parcours (inscription, connexion, mot de passe oublié, second facteur, changement d'email…) ; `flowService` gère le parcours en cours (`auth_flow`), lié au navigateur par son cookie ;
- `crypto/`, `totp/` et `helper/` : empreintes, TOTP écrit à la main, jetons ; `limit/` : les limiteurs d'échecs et d'envois, en mémoire ; `template/` : les gabarits de mails ; `export/` : les tables de l'export (CSV et ZIP faits par `common/archive/`) ;
- `projectData/projectUserData.ts` liste, pour chaque projet, comment supprimer et exporter les données d'un compte (`userData/` de chaque projet). Un nouveau projet qui garde des données par compte s'y ajoute, sinon sa suppression et son export les oublient ;
- tout nouvel événement de sécurité qu'une sauvegarde ferait oublier écrit dans le journal de restauration (`restoreJournalService.write`, §8.3).

**Front** (`projects/auth/`) : `api/me/useMe` est la source unique de « qui est connecté » ; `ProjectAccessGuard` ferme les projets privés ; la gestion du `401` (`configuration/leaveExpiredSession`) vide le cache et renvoie à la connexion. Les formulaires gardent leurs champs en `sessionStorage`, jamais un mot de passe.

**Code Node partagé** : `packages/common/src/node/` (bloc ESLint d'environnement, interdit aux dossiers du navigateur) : hash et vérification de mot de passe, comparaison à temps constant, jeton aléatoire, empreintes. Les fonctions pures partagées entre la console et le serveur vont dans `src/universal/` : `fetchWithTimeout`, limiteur en mémoire à fenêtre glissante, contrôle d'origine, `getParisDay` et `daysBefore`. Ce qui ne sert qu'au serveur (TOTP, chiffrement, parcours) reste dans le serveur.

**Bibliothèques** : natif pour tout (`crypto.argon2`, `randomBytes`, `randomInt`, `createHash`, `createHmac`, `timingSafeEqual`, AES-256-GCM) ; TOTP (RFC 6238, testé avec ses vecteurs officiels) et Base32 écrits à la main ; CSV et ZIP sans compression (`zlib.crc32`) ; une seule bibliothèque, le QR code côté front.
