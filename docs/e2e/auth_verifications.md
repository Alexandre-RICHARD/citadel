# Vérifications de fin de l'authentification

[Citadel](../../README.md) › [Tests end-to-end](e2e.md) › Vérifications de fin

La recette manuelle de l'[authentification](../auth/auth.md), en `pnpm prod:local` puis en prod, en complément des tests d'intégration et des [scénarios end-to-end](scenarios.md). À cocher une par une ; une ligne qui échoue devient un correctif. Ce qui peut être automatisé avec Playwright l'est au fil des scénarios ([todo](../todo/todo.md#82-scénarios-à-écrire)).

## Sommaire

1. [Critères transverses](#1-critères-transverses)
2. [Socle](#2-socle)
3. [Cookie et session](#3-cookie-et-session)
4. [Parcours (lien et code)](#4-parcours-lien-et-code)
5. [Inscription](#5-inscription)
6. [Connexion](#6-connexion)
7. [Mot de passe oublié](#7-mot-de-passe-oublié)
8. [Profil](#8-profil)
9. [Double authentification](#9-double-authentification)
10. [Sessions et données](#10-sessions-et-données)
11. [Projets](#11-projets)
12. [Mails](#12-mails)
13. [Restauration, RGPD, sécurité](#13-restauration-rgpd-sécurité)

## 1. Critères transverses

- [ ] `GET /auth/me` : `200` avec une session valide ; `401` sans cookie, avec un jeton altéré ou avec une session expirée.
- [ ] Expiration glissante (7 jours sans visite avec « se souvenir de moi », 12 h sans), plafond absolu de 30 jours même en restant actif.
- [ ] Isolation : jamais d'accès aux données d'un autre compte (`404`) ; tous les endpoints `protected` renvoient `401` sans session.
- [ ] IP réelle : l'IP vue par le serveur (sessions, limites) est celle du client, y compris à travers Cloudflare et Caddy.
- [ ] Mails en boîte de réception (hors indésirables) chez Gmail et Outlook, avec au moins 7/10 sur mail-tester.
- [ ] `pnpm validate-all` passe (types, lint, tests, builds, audit).
- [ ] En prod, après la mise en ligne : inscription réelle, mails reçus, 2FA, sessions, IP réelle, connexion à la console.
- [ ] Deux semaines plus tard : aucun mail de l'authentification en indésirables, rapports DMARC propres.

## 2. Socle

- [ ] `POST /api/error-log/entries` répond `404` et n'écrit rien dans `error_log`.
- [ ] Une erreur de base provoquée (inscription avec la base arrêtée) : la ligne de `error_log` et les logs du conteneur n'ont ni mot de passe, ni email, ni valeur de paramètre SQL, mais gardent le message du driver.
- [ ] Après la release : `mailing_failure` et `mailing_contact_message_unsent` existent, les anciennes tables non ; les deux alertes de la carte « Site » de la console comptent toujours.
- [ ] `citadel db-restore-test` passe après V013, puis après V020 (contraintes `CHECK`, colonne générée de `auth_factor`).
- [ ] Le job `contact-retry` renvoie toujours un message en attente.
- [ ] `MAIL_REGISTRATION_STOP` abaissé en dev : inscriptions fermées au bon seuil ; valeurs remises après.
- [ ] Le serveur refuse de démarrer sans `AUTH_CODE_HMAC_KEY`, avec une clé qui n'a pas 64 caractères hexadécimaux, ou avec une clé précédente et une version 1, en nommant la variable fautive.
- [ ] `pnpm prod:local` démarre ; la pré-prod démarre avec les clés de `.env.prod`.
- [ ] Console : `citadel admin-password` (dans l'image) et `pnpm tools hashAdminPassword` donnent une ligne `argon2id:` ; connexion avec ; un ancien hash `scrypt` empêche la console de démarrer, avec le message qui dit quoi faire.
- [ ] Console : 6 mauvais mots de passe d'affilée → `429` avec les minutes restantes ; un bon mot de passe après l'attente remet le compteur à zéro.
- [ ] Console : boutons d'action (démarrer, arrêter, bandeau) toujours acceptés depuis la console, refusés (`403`) par un `curl` sans `Origin`.
- [ ] Site : un formulaire posté depuis une page d'un autre domaine → `403` `FOREIGN_ORIGIN`, message traduit ; les `GET` d'un autre site passent.
- [ ] Formulaire de contact : deux IPv6 du même `/64` partagent la limite ; deux IPv4 voisines, non.

## 3. Cookie et session

- [ ] En prod : `__Host-citadel_session`, `HttpOnly`, `Secure`, `SameSite=Lax`, `Path=/`, sans `Domain` ; en dev : `citadel_session`, sans `Secure`.
- [ ] Sans « se souvenir de moi » : pas de `Max-Age` ; navigateur fermé puis rouvert (sans restauration des onglets) → déconnecté.
- [ ] Avec : `Max-Age` de 7 jours, renvoyé au plus toutes les 5 minutes (onglet Réseau).
- [ ] Le texte « Reste connecté 7 jours sans visite, 30 jours au plus » est sous la case, à la connexion et à l'inscription.
- [ ] Un cookie modifié à la main → `401`, retour à `/auth/login`.
- [ ] Connecté sur le PC et sur le téléphone : se déconnecter sur l'un laisse l'autre connecté.
- [ ] Déconnexion : `204`, deux fois de suite sans erreur ; les autres onglets renvoient vers la connexion à leur prochain appel ; aucune donnée du compte n'y reste affichée (cache vidé).
- [ ] Avertissement avant de se déconnecter avec un formulaire modifié, pas sans.

## 4. Parcours (lien et code)

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

## 5. Inscription

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

## 6. Connexion

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
- [ ] Mauvais mot de passe par pseudo, puis essai immédiat par l'adresse du même compte : compte à rebours (le délai vise le compte) ; par l'adresse d'un autre compte : aucun.
- [ ] Paramètres argon2 montés dans `.env` : le hash d'un compte change à sa connexion suivante, l'ancien marchait encore.

## 7. Mot de passe oublié

- [ ] Réponse identique pour un compte existant ou non ; l'adresse n'est jamais affichée.
- [ ] Avec un TOTP : demandé après le lien ; le code par mail n'est pas proposé.
- [ ] Le mot de passe actuel est refusé (`PASSWORD_UNCHANGED`) ; après le changement, toutes les sessions (téléphone compris) sont fermées ; mail de notification reçu.

## 8. Profil

- [ ] Pseudo affiché : espaces de début, de fin et en double nettoyés ; vide → le pseudo ; caractère invisible (U+200B) refusé.
- [ ] Changement d'email : mot de passe demandé, lien et code à la nouvelle adresse, notification à l'ancienne ; adresse déjà prise : même écran et mail « un autre compte a voulu… » ; prise entre-temps : `EMAIL_TAKEN`.
- [ ] Changement de mot de passe : les autres sessions fermées, celle-ci gardée.
- [ ] Actions sensibles : mot de passe redemandé ; suppression du compte : second facteur en plus.

## 9. Double authentification

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

## 10. Sessions et données

- [ ] Liste : navigateur et système justes (Edge, Firefox, Android, iOS), IP tronquée, « cette session », fin prévue.
- [ ] Connexion avec un user agent de plus de 255 caractères (`curl -A`) : session ouverte, user agent tronqué dans la liste.
- [ ] Double clic sur « S'inscrire » : un seul compte créé, et le code du second mail éventuel répond proprement, sans erreur 500.
- [ ] « Tout déconnecter sauf ici » puis « tout déconnecter » (le second renvoie vers la connexion).
- [ ] Profil : pseudo affiché modifiable, vidé il redonne le pseudo ; les trois méthodes de connexion se choisissent et la connexion les respecte.
- [ ] Changement d'email : la nouvelle adresse reçoit le lien et le code, l'ancienne la notification ; adresse déjà inscrite : même écran, et seul son propriétaire reçoit un email, sans lien ni code ; lien ouvert dans un autre navigateur : refusé.
- [ ] Changement de mot de passe : l'ancien redemandé, le même refusé, les autres sessions fermées, celle-ci gardée.
- [ ] Ajout d'une application : le QR code se scanne (Google Authenticator, Aegis, Bitwarden), la clé saisie à la main marche aussi, le premier code active ; les codes de secours s'affichent une seule fois, se téléchargent, et ne reviennent pas au rechargement.
- [ ] Facteur mail activé par son lien (`/auth/verify`) plutôt que par son code : les codes de secours s'affichent sur le profil.
- [ ] Étape « Protège ton compte » après l'inscription : « Passer cette étape » mène à la page demandée ; la fin de l'activation montre les codes de secours avant d'y mener.
- [ ] Suppression du compte avec une application d'authentification : le code (ou un code de secours) est demandé en plus du mot de passe.
- [ ] Export : le ZIP s'ouvre avec l'explorateur Windows et 7-Zip ; les CSV gardent accents et émojis dans Excel ; aucun hash, empreinte ni secret.
- [ ] Suppression des données du Backlog seul : GDC intact ; suppression du compte : plus aucune ligne, mail de confirmation, reconnexion impossible.

## 11. Projets

- [ ] GDC et Backlog déconnecté : renvoi vers `/auth/login?redirect=…`, puis retour au même endroit après la connexion.
- [ ] Les endpoints IGDB répondent `401` sans session.
- [ ] Le jeu d'un autre compte (identifiant tapé dans l'URL) : `404`.
- [ ] Série créée à la main invisible pour un autre compte ; séries IGDB communes.
- [ ] Déconnecté depuis un autre onglet : la prochaine action dans GDC ou le Backlog mène à la connexion, qui ramène à la page ; rien du compte ne reste affiché.
- [ ] Un jeu enregistré par un compte est proposé par « Ajouter un jeu depuis la Citadel » à un autre, sans sa personnalisation ; ajouté aux deux backlogs, chacun garde ses versions jouées.
- [ ] Profil : vider GDC et le Backlog d'un coup, puis l'un sans l'autre ; un mauvais mot de passe ne vide rien ; le projet vidé s'ouvre ensuite vide, sans rechargement.
- [ ] Header : « Se connecter », puis icône et pseudo affiché, et « Se déconnecter » ; icône de profil dans le Backlog et GDC ; `auth` absent de la roue et du pied de page.

## 12. Mails

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
- [ ] Aucun « mail » ni « adresse » seul pour l'email dans les textes visibles des interfaces et des emails : « email » et « adresse email » partout.

## 13. Restauration, RGPD, sécurité

- [ ] Restauration en `prod:local` d'un dump envoyé depuis le PC, sans date dans son nom : la date vient du dump, le journal est rejoué.
- [ ] Après une restauration : toutes les sessions et tous les parcours vidés, bandeau avec sa phrase « mot de passe oublié ».
- [ ] Purges : un parcours expiré disparaît en 15 minutes ; `auth_event` et `error_log` de plus de 20 jours, en un jour (horloge du serveur avancée en `prod:local`).
- [ ] `docker stop` du serveur juste après son démarrage (purges en cours) : aucune erreur de purge dans les logs ni dans `error_log`.
- [ ] Base arrêtée quelques minutes : une erreur par purge dans les logs, puis les purges reprennent seules quand la base revient, et le serveur ne s'arrête pas.
- [ ] « Données personnelles » : chaque point de la page décrite dans la documentation de l'authentification (§8.4), et un lien `contact@` qui marche.
- [ ] Aucun cookie posé avant la connexion, hors ceux de Cloudflare listés.
- [ ] Les nouvelles pages ne déclenchent aucune violation de CSP (console du navigateur).
- [ ] `docker logs site-prod-server` après une recette complète : aucun mot de passe, code, jeton ni lien.
- [ ] Pages de l'authentification sur mobile, en clair et en sombre, au clavier seul, et avec le zoom à 200 %.
- [ ] Changement d'email vers l'adresse actuelle (même en majuscules) : refusé tout de suite (`EMAIL_UNCHANGED`), aucun email.
- [ ] Suppression du compte avec une application : un code de secours faux, répété, finit en « trop d'essais » ; redonner le bon mot de passe entre deux erreurs de code n'efface pas le compte à rebours.
- [ ] Session expirée pendant une modification du Backlog ou de GDC : aucun toast « Échec de … » par-dessus la connexion ; un autre compte connecté ensuite dans le même onglet ne voit rien du premier.
- [ ] Double clic sur l'ajout d'un jeu au backlog : un seul ajout, pas de 500.
- [ ] Deux comptes en même temps sur le Backlog : l'un retire un jeu pendant que l'autre en range un dans une nouvelle série ; aucun des deux n'attend ni n'échoue.
- [ ] Vider le Backlog depuis le profil, ou supprimer le compte, pendant qu'un autre onglet modifie un jeu : pas de 500, et aucune ligne du compte ne reste.
- [ ] Export : `backlog_series.csv` donne le nom de chaque série de `backlog_user_game.csv`, séries IGDB comprises.
- [ ] Edge : une seule icône d'œil dans les champs mot de passe (Edge ajoute la sienne à côté de la nôtre).
- [ ] Se déconnecter juste après une mort comptée dans GDC (requête lente) : avertissement ; « Annuler » garde la session. Sur téléphone, le header tient sur une ligne, profil et déconnexion en icônes.
- [ ] `citadel config-backup` : l'archive ne contient pas `site-prod-server/restore-journal`.
- [ ] Journal de restauration : après un premier `citadel deploy`, `/Volume1/appdata/site-prod-server/restore-journal` appartient à 1000 en 700 ; un changement de mot de passe y écrit une ligne ; en `prod:local`, la même ligne dans le volume (`docker exec site-prod-server cat /var/lib/citadel/restore-journal/*.jsonl`).
- [ ] Journal impossible à écrire (dossier en lecture seule) : l'action échoue (500) et ne change rien ; l'erreur arrive dans `error_log`.
- [ ] En `prod:local` : restaurer une sauvegarde, créer un compte (il reprend l'identifiant d'un compte perdu), lui changer son email, puis restaurer le dump « avant-restauration » : le compte d'origine garde son email.
- [ ] Un code de secours utilisé pour se connecter, puis une restauration d'avant : il est refusé.
- [ ] Cookies du site en navigation privée, après connexion : `citadel_session` et `citadel_flow` seulement, aucun `lang` ni cookie de Cloudflare hors `__cf_bm`.
- [ ] Console du navigateur en `prod:local`, sur chaque page : aucune violation de la CSP, sauf `wasm-eval` sur Angers Irigo (sonde WebAssembly de `long.js`, sans effet).
