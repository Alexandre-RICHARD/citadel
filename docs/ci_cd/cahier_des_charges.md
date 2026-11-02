# CI/CD et hébergement sur le NAS — Cahier des charges

[Citadel](../../README.md) › [Hébergement et mise en production](README.md) › Cahier des charges

2 novembre 2026 · v12 : relance du soir des messages de contact, aperçu des gabarits de mail dans Storybook · v11 : un message de contact dont le mail échoue est gardé en base ; échecs signalés (console du NAS) · v10 : socle serveur, quota et formulaire de contact codés ; reste la recette et la mise en prod · v9 : Brevo retenu (essai), quota quotidien surveillé · v8 : accusé de réception avec le sujet, réponses en tant que `contact`, messages gardés une semaine · v7 : adresses, formulaire de contact, roadmap complète · v6 : l'hébergement est en place, son mode d'emploi est dans le [README](README.md). Il ne reste que les mails, dernier prérequis du [cahier de l'authentification](../auth/cahier_des_charges.md).

Conventions :
- Dans la roadmap (§7), **[toi]**, **[moi]** ou **[nous]** dit qui fait l'étape.
- Quand tu tranches entre plusieurs options, les autres disparaissent du document.

## Sommaire

- §1 Le besoin et les adresses
- §2 Envoi
- §3 Réception : `contact`
- §4 Formulaire de contact
- §5 DNS chez Cloudflare
- §6 Côté serveur
- §7 Roadmap
- §8 Questions ouvertes

---

## 1. Le besoin et les adresses

| Nom | Adresse | Rôle |
|---|---|---|
| `noreply` | `noreply@alexandre-richard.fr` | Expéditeur de tous les mails du site, par un fournisseur (§2). Ne reçoit rien |
| `contact` | `contact@alexandre-richard.fr` | Adresse publique : pages légales, bas du formulaire de contact. Passe-plat : tout ce qu'elle reçoit part vers `perso` (§3) |
| `perso` | ta boîte Gmail | Te prévient qu'un mail est arrivé ; tu y réponds en tant que `contact` (§3). Jamais affichée, ni sur le site ni dans une réponse |

- **Envoi** : le formulaire de contact (§4), puis les mails de l'authentification (liste au §8.3 de son cahier).
- Aucune boîte mail n'est hébergée, ni sur le NAS ni ailleurs.

---

## 2. Envoi

- **Par un fournisseur** (SMTP ou API HTTP), pas directement depuis le NAS : son IP résidentielle est listée comme « domestique » par les listes anti-spam, le port 25 sortant est souvent bloqué et il n'y a pas de résolution inverse. Gmail et Outlook classeraient les mails en indésirables, ou les refuseraient.
- **Brevo**, société française, en essai : offre gratuite de 300 mails par jour, sans limite de durée, avec un SMTP (`smtp-relay.brevo.com`, port 587) pour tes réponses depuis Gmail (§3) et une API HTTP pour le serveur, appelée avec `fetch`, sans bibliothèque. Si l'essai ne convainc pas, le serveur ne dépend que de l'abstraction « expéditeur » (§6) : changer de fournisseur (Mailjet : 200 par jour ; Scaleway : 300 par mois) ne touche qu'elle, le DNS et les identifiants.
- **Toujours de `noreply`**. Le `Reply-To` dit où va une réponse (§4).
- **Identifiants** : créés dans Bitwarden d'abord, puis dans `.env` (dev) et `.env.prod`.
- **Brevo valide parfois à la main** les nouveaux comptes. `noreply` et `contact` doivent y être déclarés comme expéditeurs, en plus du domaine.

### Le quota quotidien

300 mails par jour, partagés entre le formulaire de contact, tes réponses depuis Gmail et l'authentification. Atteint, Brevo refuse les suivants : un visiteur qui se connecte par mail ou réinitialise son mot de passe se retrouve alors bloqué. Les mails les moins utiles s'arrêtent donc en premier :

| Seuil (variable `MAIL_…`) | Valeur par défaut | Ce qui s'arrête |
|---|---|---|
| `MAIL_REGISTRATION_STOP` | 250 mails | Les inscriptions (elles coûtent deux mails, §8.3 de l'authentification) |
| `MAIL_CONTACT_STOP` | 280 mails | Le formulaire de contact : `contact@` reste affiché pour écrire directement |
| `MAIL_DAILY_LIMIT` | 300 mails | Tout le reste, y compris la connexion |

- **Le décompte vient de Brevo**, pas du serveur : `GET /v3/account` donne les envois restants du jour (`plan[].credits`, sur 300), ceux de tes réponses depuis Gmail compris, et il survit aux déploiements. Le serveur le relit au plus une fois par minute et y ajoute ses propres envois depuis le relevé. Si Brevo ne répond pas, il garde le dernier relevé et compte lui-même, en mémoire (de zéro un nouveau jour).
- **Le site le sait** : un endpoint sans connexion (`GET /mail/status`) dit quelles fonctions sont ouvertes. Le front le relit toutes les 5 minutes, désactive le formulaire (puis le bouton d'inscription) et affiche le bandeau du site, empilé sous celui de la console : « Le formulaire de contact est fermé pour aujourd'hui, il rouvre demain. Vous pouvez toujours écrire à contact@alexandre-richard.fr. » L'inscription aura le sien. Tout rouvre seul quand le compteur retombe à zéro.
- **Tu es prévenu**: un mail à `contact` (donc dans `perso`) au premier franchissement de chaque seuil du jour, une fois seulement par seuil et par jour. Pour la fermeture totale, c'est le dernier mail que Brevo laisse partir : le seuil d'alerte est un peu sous la limite.
- **Remise à zéro** : Brevo remet les crédits à 300 entre minuit et 1 h (constaté le 2 novembre). La réouverture du site suit ce compteur ; le jour du serveur (heure de Paris, pour l'alerte unique et l'accusé quotidien) peut s'en décaler d'une heure, sans conséquence.
- **Suivi anonymisé, pas supprimé** : l'offre gratuite de Brevo ne permet pas de le couper sur les mails transactionnels. Il garde un pixel d'ouverture et réécrit les liens par `r.mail.alexandre-richard.fr` (notre sous-domaine, mais Brevo les voit passer). Réglage « Suivi anonyme » sur Oui dans Brevo (fait), et `contactPixelTrackingConsent: false` dans chaque envoi. Acceptable pour l'essai : le lien d'un mail de connexion ne sert que dans le navigateur qui a commencé le parcours, et le code est à usage unique. À annoncer sur la page « Données personnelles ». Si ça pèse au moment de l'authentification, c'est un critère pour changer de fournisseur.
- **Chaque mail part en HTML et en texte brut**, en UTF-8 (vérifier que Brevo envoie bien les deux parties).

### Délivrabilité : le test du 1er novembre 2026

Un accusé de réception réaliste, envoyé à [mail-tester.com](https://www.mail-tester.com) depuis `noreply` par l'API de Brevo : **6,3/10**, SpamAssassin à 2,2 sur 5 (le seuil du spam). Le mail n'est donc pas du spam, mais « certaines boîtes peuvent encore le refuser ».

| Constat | Points perdus | Cause | Que faire |
|---|---|---|---|
| IP d'envoi (`77.32.148.25`) listée par SpamCop, « jaune » chez Hostkarma | environ 1 à 2,5 | **IP partagée** de l'offre gratuite de Brevo : sa réputation ne dépend pas de nous, et l'IP change d'un envoi à l'autre | Rien côté code. Surveiller ; une IP dédiée est payante |
| `HTML_IMAGE_ONLY_16`, corps « contenant des erreurs », 2 images sans `alt` | environ 2 | Le **pixel d'ouverture** que Brevo ajoute (il compte pour des images) face à un mail court | Écrire plus de texte dans chaque mail (le pixel, lui, ne se retire pas) |

- **Passé** : SPF, DKIM (2048 bits, aligné sur le domaine), DMARC, DNS inverse de l'IP, `List-Unsubscribe`, aucun lien raccourci ni cassé, non listé chez Spamhaus et Barracuda.
- **Gabarits** : chaque mail a plusieurs phrases de vrai texte, en HTML et en texte brut ; jamais un mail réduit à un code et un lien.
- **Recette** : les gabarits repassent par mail-tester avant la mise en prod, objectif au moins 7/10 et SpamAssassin sous 3. Les mails d'un vrai parcours sont aussi contrôlés dans Gmail et Outlook (hors spam).
- **Si les mails d'authentification tombent en spam à l'usage** : l'essai de Brevo est un échec, et on passe à un autre fournisseur (§6, l'abstraction « expéditeur »). Les enregistrements DNS DKIM de Brevo sont à retirer en même temps.


---

## 3. Réception : `contact`

- **Cloudflare Email Routing**, gratuit : une règle `contact` → `perso`. `perso` est d'abord validée par un lien que Cloudflare y envoie. Pas de « catch-all » : toute autre adresse du domaine, `noreply` comprise, est refusée.
- **Le mail transféré garde son expéditeur d'origine** (en-tête `From`) : `perso` voit qui a écrit.
- **Répondre en tant que `contact`** : Gmail « Envoyer des e-mails en tant que » `contact`, par le SMTP du fournisseur d'envoi (§2). Gmail valide l'adresse par un code envoyé à `contact`, qui arrive donc dans `perso`. Réglage « Répondre à partir de l'adresse à laquelle le message a été envoyé » : une réponse à un mail reçu par `contact` part de `contact`, et `perso` n'apparaît nulle part. Ces réponses comptent dans le quota du fournisseur.
- Un filtre Gmail sur `to:contact@alexandre-richard.fr` range tout ce qui passe par `contact` sous un libellé « Contact », jamais en indésirables.

---

## 4. Formulaire de contact

- **Où** : la page « Contact » de la homepage (`/homepage/contact`), deuxième lien du footer, dans le même cadre que « À propos ». Sous le formulaire : « Vous pouvez aussi écrire directement à contact@alexandre-richard.fr ». Échap dans un champ ne ferme pas la page. Endpoint : `POST /contact/messages`, `200` avec ce qu'il est advenu de l'accusé de réception (`SENT`, `ALREADY_SENT_TODAY`, `FAILED`, `NO_EMAIL`), que l'écran « Message envoyé » reprend.
- **Champs** : sujet et message obligatoires ; email et nom facultatifs. Longueurs maximales dans les schémas zod de `packages/specs`. Un champ piège caché (honeypot) : rempli, le serveur répond comme un succès et n'envoie rien.
- **À l'envoi**, deux mails, tous les deux de `noreply` :

| Mail | Vers | Contenu |
|---|---|---|
| Notification | `contact`, donc `perso` | Objet « [Contact] » + sujet ; nom, email, sujet, message, date. `Reply-To` : l'email du visiteur s'il l'a donné, pour lui répondre d'un clic |
| Accusé de réception, si un email est donné | le visiteur | Message bien reçu, avec son sujet ; réponse à cette adresse. En bas : « Si vous remplissez un autre formulaire de contact dans la même journée, vous ne recevrez pas d'autre accusé de réception. » `Reply-To` : `contact` |

- **L'accusé de réception ne reprend du visiteur que le sujet**, ni le nom, ni le message : sinon, le formulaire servirait à envoyer n'importe quel texte à n'importe quelle adresse, au nom du domaine. Le sujet est court (longueur maximale dans les specs), et un seul accusé par adresse et par jour.
- **Limites**, pour la réputation du domaine et le quota du fournisseur (que l'authentification partagera) : par IP, `CONTACT_HOURLY_LIMIT_PER_IP` messages par heure (5) ; par adresse, un accusé de réception par jour au plus ; le plafond global du jour est le seuil `MAIL_CONTACT_STOP` du quota (`403 CONTACT_CLOSED`). Au-delà de la limite par IP : `429` + `Retry-After`, compte à rebours sur le bouton.
- Les deux mails en HTML et en texte brut (§2), en français, en vouvoiement. Notification qui échoue : le message est gardé en base (ci-dessous), réponse `200` ; seulement si la base échoue aussi, `502 MAIL_UNAVAILABLE`, toast d'erreur avec « Réessayer ». Un accusé qui échoue est logué, et le visiteur le sait (`FAILED`, toast d'erreur), son message étant bien arrivé.
- **Rien en base, sauf si la notification ne peut pas partir** : le message complet (sujet, texte, nom, adresse ; jamais l'IP) est alors gardé dans `contact_message_unsent`, pour que personne ne soit perdu, et le visiteur voit un succès. Chaque soir, la relance (§6) les renvoie et efface chaque ligne dont le mail est parti ; la console du NAS signale ceux qui attendent. Si la base échoue aussi, le visiteur garde l'erreur `502` et son texte. Tu supprimes les messages de `perso` dans la semaine. La page « Données personnelles » dit ce qui est collecté, pourquoi, que c'est gardé une semaine au plus (en base : jusqu'à ce que l'envoi réussisse), et que le fournisseur d'envoi le voit passer.

---

## 5. DNS chez Cloudflare

Tous les enregistrements en « DNS seulement » (nuage gris).

| Enregistrement | Rôle | Qui le crée |
|---|---|---|
| MX | Où arrivent les mails de `contact` | Email Routing, à son activation |
| SPF (TXT) | Les serveurs autorisés à envoyer pour le domaine | Email Routing (racine). Brevo n'y touche pas : il envoie par `mail.alexandre-richard.fr` |
| DKIM (CNAME `brevo1` et `brevo2`) | La signature des mails envoyés par Brevo | Brevo, posés dans Cloudflare par la vérification automatique |
| CNAME `mail.`, `r.mail.`, `img.mail.` | Domaine de retour et de suivi de Brevo (SPF aligné) | Brevo |
| DMARC (TXT `_dmarc`) | Ce que fait le destinataire d'un mail qui échoue à SPF et DKIM | Brevo : `p=none` |

- **Un seul enregistrement SPF** par nom : deux enregistrements SPF les rendent tous les deux invalides. Ne jamais en ajouter un second sur la racine.
- **Rapports DMARC** : envoyés à Brevo (`rua@dmarc.brevo.com`), lus dans son interface.
- **DMARC** : `p=none` (on observe seulement), puis `p=quarantine` après deux semaines de rapports propres.
- **Critère** : un mail de test arrive en boîte de réception chez Gmail et Outlook, avec SPF, DKIM et DMARC à « pass » dans ses en-têtes, et au moins 7/10 sur mail-tester (§2).

---

## 6. Côté serveur

Socle construit ici et repris par l'authentification, qui l'avait prévu (son §7.2 et son §8.1) :

- **Expéditeur** : une abstraction, avec trois versions, choisie par `MAIL_SENDER`. `brevo` en prod (ou en dev, pour un envoi réel) ; `memory` pour les tests ; `journal` en dev par défaut, en pré-prod et en `prod:local`, qui écrit dans le log le type du mail qui serait parti, sans contenu ni adresse. La pré-prod tourne sur `.env.prod` : compose lui impose `journal` et ne lui donne pas la clé ; `prod:local` reçoit une clé factice.
- Envoi pendant la requête, 10 s au plus. Un échec est logué sans contenu (ni message, ni adresse) ; le visiteur voit une erreur et garde son texte dans le formulaire.
- **Échecs en base** : tout envoi refusé par Brevo laisse une ligne dans `mail_failure` (type du mail, raison, date ; ni adresse ni contenu), effacée après 90 jours. Seul le formulaire de contact garde en plus le contenu (`contact_message_unsent`, §4). `GET /internal/mail/failures` (7 jours) et `GET /internal/contact/unsent` (messages en attente) donnent leur nombre : Caddy bloque `/api/internal` depuis Internet, le serveur refuse toute requête portant le `X-Real-IP` de Caddy, et la console du NAS l'appelle par le réseau Docker (`SITE_API_URL`). Sa carte « Site » affiche alors une alerte, sans action (rouge pour un message de contact à lire, orange pour un simple mail perdu) : le détail est en base.
- **Relance du soir** : le job `contact-retry` d'infra-ops (`infra/ops/crontab`, **23 h 50**, avant la remise à zéro des crédits de Brevo, entre minuit et 1 h) appelle `POST /internal/contact/unsent/retry` depuis le conteneur du serveur (`docker exec` : aucun réseau de plus pour infra-ops). Pour chaque message en base, du plus ancien au plus récent : (1) si le seuil `MAIL_CONTACT_STOP` est atteint, arrêt (le reste attend le soir suivant) ; (2) la notification d'origine, au même contenu et avec la date où le visiteur a écrit, le sujet suivi de « (différé) » ; (3) la ligne est supprimée ; (4) l'accusé de réception, un par adresse et par relance, avec une phrase disant qu'il arrive avec du retard (on ne sait pas s'il était parti). Un refus du fournisseur arrête la relance et fait échouer le job (visible dans la console) ; un accusé refusé est seulement logué. Ces relances n'ajoutent rien à `mail_failure`. Le bilan (`sentCount`, `remainingCount`, `stoppedBecause`) est affiché par le job.
- **IP réelle** : Caddy écrase un en-tête `X-Real-IP` avec l'IP qu'il a validée ; le serveur ne lit que lui (cahier de l'authentification, §7.2). Les limites du formulaire en dépendent : derrière Caddy, tous les visiteurs ont sinon la même IP.
- **`429` + `Retry-After`** de bout en bout : specs, `AppError`, `globalErrorHandler`, `ApiError` du front.
- **Aperçu des gabarits** : le Storybook du design system (`pnpm --filter @citadel/design-system dev`, port 3002, section « Mails », dossier `src/mailPreview`) affiche chaque gabarit comme le reçoit un destinataire : en-têtes, HTML (dans un cadre isolé, en clair ou en sombre, en largeur bureau ou téléphone) et texte brut côte à côte, avec ses variantes (sans adresse, différé, caractères spéciaux, chaque seuil du quota). Il se recharge à chaque modification d'un gabarit : plus besoin de s'envoyer des mails pour les voir. Les gabarits sont des fonctions pures du serveur, importées telles quelles (le design system en dépend en développement seulement) ; chaque nouveau gabarit (authentification, étapes 34 et 35) y ajoute sa story. Tous partagent la mise en page de `buildMailBodies`, aux couleurs de la Citadel : en-tête sombre, briques (paragraphe, citation, champs, encadré, bouton, jauge, statuts, signature) écrites à la fois en HTML et en texte brut, mode sombre et téléphone, sans image ni ressource externe. Un gabarit ne décrit que son contenu. Le rendu réel dans Gmail et Outlook reste à vérifier une fois (mail-tester, roadmap).
- **Quota** : lecture du compteur de Brevo, seuils, `GET /mail/status`, mail d'alerte (§2). Tout mail passe par `mailService`, qui l'envoie et le compte.
- Compteurs des limites par IP et par adresse, et alertes déjà envoyées, en mémoire (une seule instance), remis à zéro à chaque déploiement.
- Variables : `MAIL_SENDER`, `BREVO_API_KEY`, les trois seuils et `CONTACT_HOURLY_LIMIT_PER_IP`, dans la partie « Mails » d'`env.ts` (zod, valeurs par défaut pour les seuils), `.env.example`, `.env.test` et `infra/compose.yml`.

---

## 7. Roadmap

Chaque étape [moi] est un commit relisible, avec ses tests ; `pnpm validate-all` passe à chaque commit. Je te donne le pas-à-pas de chaque étape [toi] au moment de la faire.

**Phase 1 — Recette**

1. [toi] Les deux mails de l'envoi réel depuis le dev (1er novembre au soir, sujet « Test du formulaire de contact (envoi réel depuis le dev) ») : notification et accusé de réception dans `perso`. Vérif : hors indésirables, accents et emoji intacts, `<b>` affiché tel quel et non en gras.
2. [nous] mail-tester sur un vrai accusé de réception (tu me donnes une adresse, je l'envoie par le formulaire), et un message vers une adresse Outlook si tu en as une. Vérif : le critère du §5.
3. [toi] Recette visuelle en dev (`MAIL_SENDER=journal`, seuils abaissés dans `.env` pour voir la fermeture), puis en `pnpm prod:local`, console comprise : un échec d'envoi forcé (clé factice et `MAIL_SENDER=brevo` sur le serveur local) fait apparaître l'alerte de la carte « Site » ; le job `contact-retry` lancé à la main depuis la console (ou `citadel contact-retry`) les renvoie, ce que le journal du serveur local confirme.

**Phase 2 — Mise en prod**

4. [nous] `pnpm release`, puis en prod : un message avec email, un sans, un mail direct à `contact`. Vérif : notifications et accusé de réception reçus en boîte de réception, expéditeurs visibles dans `perso`, une réponse à l'accusé arrive dans `perso`, ta réponse au visiteur part de `contact`.
5. [toi] Deux semaines plus tard, rapports DMARC propres : `p=quarantine`.

---

## 8. Questions ouvertes

Aucune.
