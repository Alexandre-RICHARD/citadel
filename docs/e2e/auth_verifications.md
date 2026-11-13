# Vérifications de fin de l'authentification

[Citadel](../../README.md) › [Tests end-to-end](e2e.md) › Vérifications de fin

La recette manuelle de l'[authentification](../auth/auth.md), en `pnpm prod:local` puis en prod : seulement ce qu'aucun test ne peut faire (appareils réels, prod, infra, fournisseurs). Tout le reste est dans les [scénarios end-to-end](scenarios.md) et les tests d'intégration. À cocher une par une ; une ligne qui échoue devient un correctif. Ce qui peut être automatisé avec Playwright l'est au fil des scénarios ([todo](../todo/todo.md#81-scénarios-à-écrire)).

## Sommaire

1. [Critères transverses](#1-critères-transverses)
2. [Socle](#2-socle)
3. [Cookie et session](#3-cookie-et-session)
4. [Lien et code](#4-lien-et-code)
5. [Inscription et connexion](#5-inscription-et-connexion)
6. [Double authentification](#6-double-authentification)
7. [Sessions et export](#7-sessions-et-export)
8. [Emails](#8-emails)
9. [Restauration, RGPD, sécurité](#9-restauration-rgpd-sécurité)

## 1. Critères transverses

- [ ] IP réelle : l'IP vue par le serveur (sessions, limites) est celle du client, y compris à travers Cloudflare et Caddy.
- [ ] Emails en boîte de réception (hors indésirables) chez Gmail et Outlook, avec au moins 7/10 sur mail-tester.
- [ ] En prod, après la mise en ligne : inscription réelle, emails reçus, 2FA, sessions, IP réelle, connexion à la console.
- [ ] Deux semaines plus tard : aucun email de l'authentification en indésirables, rapports DMARC propres.

## 2. Socle

- [ ] Une erreur de base provoquée (inscription avec la base arrêtée) : la ligne de `error_log` et les logs du conteneur n'ont ni mot de passe, ni email, ni valeur de paramètre SQL, mais gardent le message du driver.
- [ ] Après la release : `mailing_failure` et `mailing_contact_message_unsent` existent, les anciennes tables non ; les deux alertes de la carte « Site » de la console comptent toujours.
- [ ] `citadel db-restore-test` passe après V013, puis après V020 (contraintes `CHECK`, colonne générée de `auth_factor`).
- [ ] Le job `contact-retry` renvoie toujours un message en attente.
- [ ] `pnpm prod:local` démarre ; la pré-prod démarre avec les clés de `.env.prod`.
- [ ] Console : `citadel admin-password` (dans l'image) et `pnpm tools hashAdminPassword` donnent une ligne `argon2id:` ; connexion avec ; un ancien hash `scrypt` empêche la console de démarrer, avec le message qui dit quoi faire.
- [ ] Console : 6 mauvais mots de passe d'affilée → `429` avec les minutes restantes ; un bon mot de passe après l'attente remet le compteur à zéro.
- [ ] Console : boutons d'action (démarrer, arrêter, bandeau) toujours acceptés depuis la console, refusés (`403`) par un `curl` sans `Origin`.
- [ ] Formulaire de contact : deux IPv6 du même `/64` partagent la limite ; deux IPv4 voisines, non.

## 3. Cookie et session

- [ ] En prod : `__Host-citadel_session`, `HttpOnly`, `Secure`, `SameSite=Lax`, `Path=/`, sans `Domain` ; en dev : `citadel_session`, sans `Secure`.
- [ ] Sans « se souvenir de moi » : pas de `Max-Age` ; navigateur fermé puis rouvert (sans restauration des onglets) → déconnecté.
- [ ] Connecté sur le PC et sur le téléphone : se déconnecter sur l'un laisse l'autre connecté.

## 4. Lien et code

- [ ] Lien ouvert sur le téléphone : la page dit d'utiliser le code ; le code tapé sur le PC marche.
- [ ] Code collé avec des espaces, ou depuis une notification : accepté. Code à 5 chiffres : bouton désactivé.
- [ ] Le lien réécrit par Brevo (`r.mail.`) mène bien à `/auth/verify`.

## 5. Inscription et connexion

- [ ] Bitwarden propose d'enregistrer le mot de passe (attributs `autocomplete`) et le remplit à la connexion.
- [ ] 15 échecs : `429` pour ce compte depuis cette IP ; le même compte s'ouvre depuis le téléphone en 4G.
- [ ] Un mauvais mot de passe toutes les 2 s depuis le téléphone en 4G : la connexion depuis le PC reste possible, sans compte à rebours.
- [ ] Paramètres argon2 montés dans `.env` : le hash d'un compte change à sa connexion suivante, l'ancien marchait encore.

## 6. Double authentification

- [ ] QR code lu par Google Authenticator, Aegis et Bitwarden ; émetteur « Citadel », email en libellé ; clé manuelle qui marche aussi.
- [ ] Rotation de clé (nouvelle clé, version 2, ancienne en clé précédente) : le TOTP marche, puis `key_version` passe à 2 après usage.
- [ ] Quota épuisé : code par email grisé, TOTP et codes de secours toujours là.
- [ ] Une dizaine de connexions par email terminées en même temps vers le second facteur (boucle de `curl` en parallèle) : aucune ne reste bloquée, aucune `DatabaseError`.

## 7. Sessions et export

- [ ] Liste : navigateur et système justes (Edge, Firefox, Android, iOS), IP tronquée, « cette session », fin prévue.
- [ ] Export : le ZIP s'ouvre avec l'explorateur Windows et 7-Zip ; les CSV gardent accents et émojis dans Excel ; aucun hash, empreinte ni secret.

## 8. Emails

- [ ] Chaque gabarit en clair et en sombre, sur mobile et sur ordinateur, dans Gmail et Outlook ; le code se copie d'un appui long sur mobile.
- [ ] Quota épuisé : `MAIL_CLOSED` et son message pour la connexion par email, le mot de passe oublié, le changement d'email, l'activation du facteur email.
- [ ] Brevo coupé (mauvaise clé) : l'inscription répond comme d'habitude, l'échec est dans `mailing_failure` et la console.
- [ ] Répondre à un email de l'authentification (envoyé de `noreply`, sans adresse de réponse) : rien n'arrive nulle part ; Brevo accepte bien l'envoi sans adresse de réponse. Seuls l'accusé de réception et la notification du contact se répondent.
- [ ] Brevo refuse un email (adresse email invalide) : ni `error_log` ni `mailing_failure` ne contiennent l'adresse.
- [ ] Une seule place restante au quota, deux demandes de lien en même temps : les deux répondent pareil, l'échec éventuel est dans `mailing_failure`, rien ne casse.
- [ ] « Ta dernière connexion » (compte déjà inscrit) : « aujourd'hui », jours, semaines, mois et années justes, autour de minuit à Paris et d'un changement d'heure.
- [ ] Aucun « email » ni « adresse » seul pour l'email dans les textes visibles des interfaces et des emails : « email » et « adresse email » partout.

## 9. Restauration, RGPD, sécurité

- [ ] Restauration en `prod:local` d'un dump envoyé depuis le PC, sans date dans son nom : la date vient du dump, le journal est rejoué.
- [ ] Après une restauration : toutes les sessions et tous les parcours vidés, bandeau avec sa phrase « mot de passe oublié ».
- [ ] Purges : un parcours expiré disparaît en 15 minutes ; `auth_event` et `error_log` de plus de 20 jours, en un jour (horloge du serveur avancée en `prod:local`).
- [ ] `docker stop` du serveur juste après son démarrage (purges en cours) : aucune erreur de purge dans les logs ni dans `error_log`.
- [ ] Base arrêtée quelques minutes : une erreur par purge dans les logs, puis les purges reprennent seules quand la base revient, et le serveur ne s'arrête pas.
- [ ] « Données personnelles » : chaque point de la page décrite dans la documentation de l'authentification (§8.4), et un lien `contact@` qui marche.
- [ ] Aucun cookie posé avant la connexion, hors ceux de Cloudflare listés.
- [ ] Les nouvelles pages ne déclenchent aucune violation de CSP (console du navigateur).
- [ ] `docker logs site-prod-server` après une recette complète : aucun mot de passe, code, jeton ni lien.
- [ ] Deux comptes en même temps sur le Backlog : l'un retire un jeu pendant que l'autre en range un dans une nouvelle série ; aucun des deux n'attend ni n'échoue.
- [ ] Vider le Backlog depuis le profil, ou supprimer le compte, pendant qu'un autre onglet modifie un jeu : pas de 500, et aucune ligne du compte ne reste.
- [ ] Edge : une seule icône d'œil dans les champs mot de passe (Edge ajoute la sienne à côté de la nôtre).
- [ ] `citadel config-backup` : l'archive ne contient pas `site-prod-server/restore-journal`.
- [ ] Journal de restauration : après un premier `citadel deploy`, `/Volume1/appdata/site-prod-server/restore-journal` appartient à 1000 en 700 ; un changement de mot de passe y écrit une ligne ; en `prod:local`, la même ligne dans le volume (`docker exec site-prod-server cat /var/lib/citadel/restore-journal/*.jsonl`).
- [ ] Journal impossible à écrire (dossier en lecture seule) : l'action échoue (500) et ne change rien ; l'erreur arrive dans `error_log`.
- [ ] En `prod:local` : restaurer une sauvegarde, créer un compte (il reprend l'identifiant d'un compte perdu), lui changer son email, puis restaurer le dump « avant-restauration » : le compte d'origine garde son email.
- [ ] Un code de secours utilisé pour se connecter, puis une restauration d'avant : il est refusé.
- [ ] Cookies du site en navigation privée, après connexion : `citadel_session` et `citadel_flow` seulement, aucun `lang` ni cookie de Cloudflare hors `__cf_bm`.
- [ ] Console du navigateur en `prod:local`, sur chaque page : aucune violation de la CSP, sauf `wasm-eval` sur Angers Irigo (sonde WebAssembly de `long.js`, sans effet).
