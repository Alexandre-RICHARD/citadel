# Mails

[Citadel](../../README.md) › Mails

Les mails du site : adresses, envoi par Brevo et son quota, réception de `contact@`, formulaire de contact, DNS, et ce que fait le serveur. Les mails propres à l'authentification sont dans [authentification, §6](../auth/auth.md#6-mails-de-lauthentification) ; l'hébergement, dans [infra](../infra/infra.md). Ce qui reste à faire est dans le [todo](../todo/todo.md#3-mails).

## Sommaire

1. [Les adresses](#1-les-adresses)
2. [Envoi](#2-envoi)
3. [Réception de contact@](#3-réception-de-contact)
4. [Formulaire de contact](#4-formulaire-de-contact)
5. [DNS chez Cloudflare](#5-dns-chez-cloudflare)
6. [Côté serveur](#6-côté-serveur)

## 1. Les adresses

| Nom | Adresse | Rôle |
|---|---|---|
| `noreply` | `noreply@alexandre-richard.fr` | Expéditeur de tous les mails du site, par un fournisseur (§2). Ne reçoit rien |
| `contact` | `contact@alexandre-richard.fr` | Adresse publique : pages légales, bas du formulaire de contact. Passe-plat : tout ce qu'elle reçoit part vers `perso` (§3) |
| `perso` | Boîte Gmail personnelle | Prévient qu'un mail est arrivé ; les réponses partent de `contact` (§3). Jamais affichée, ni sur le site ni dans une réponse |

- **Envoi** : le formulaire de contact (§4) et les mails de l'[authentification](../auth/auth.md#6-mails-de-lauthentification).
- Aucune boîte mail n'est hébergée, ni sur le NAS ni ailleurs.

## 2. Envoi

### 2.1 Fournisseur

- **Par un fournisseur** (SMTP ou API HTTP), pas directement depuis le NAS : son IP résidentielle est listée comme « domestique » par les listes anti-spam, le port 25 sortant est souvent bloqué et il n'y a pas de résolution inverse. Gmail et Outlook classeraient les mails en indésirables, ou les refuseraient.
- **Brevo** (société française, offre gratuite de 300 mails par jour, sans limite de durée) : un SMTP (`smtp-relay.brevo.com`, port 587) pour les réponses depuis Gmail (§3) et une API HTTP pour le serveur, appelée avec `fetch`, sans bibliothèque. Écartés : Mailjet (200 mails par jour), Scaleway (300 par mois).
- **Changer de fournisseur**, si les mails tombent en indésirables à l'usage : seuls l'abstraction « expéditeur » (§6), le DNS (retirer les DKIM de Brevo) et les identifiants changent.
- **Toujours de `noreply`**. Le `Reply-To` dit où va une réponse (§4).
- **Identifiants** : créés dans Bitwarden d'abord, puis dans `.env` (dev) et `.env.prod`.
- `noreply` et `contact` doivent être déclarés comme expéditeurs dans Brevo, en plus du domaine.

### 2.2 Contenu et délivrabilité

- **Chaque mail part en HTML et en texte brut**, en UTF-8, avec plusieurs phrases de vrai texte : jamais un mail réduit à un code et un lien.
- **Pourquoi** : le premier test sur [mail-tester.com](https://www.mail-tester.com) (1er novembre 2026, un accusé de réception réaliste) a donné 6,3/10. SPF, DKIM (2048 bits, aligné sur le domaine), DMARC, DNS inverse et `List-Unsubscribe` passaient. Les points perdus venaient de l'IP partagée de l'offre gratuite (listée par SpamCop, à surveiller, une IP dédiée est payante) et du pixel d'ouverture de Brevo face à un mail trop court (`HTML_IMAGE_ONLY`). Le pixel ne se retire pas : seul le texte compense.
- **Objectif** : au moins 7/10 sur mail-tester, SpamAssassin sous 3, et les mails d'un vrai parcours en boîte de réception chez Gmail et Outlook.
- **Suivi** : l'offre gratuite de Brevo ne permet pas de couper le suivi des mails transactionnels. Il garde un pixel d'ouverture et réécrit les liens par `r.mail.alexandre-richard.fr`, donc il les voit passer. Réglage « Suivi anonyme » sur Oui, et `contactPixelTrackingConsent: false` dans chaque envoi. Annoncé sur la page « Données personnelles » ([authentification, §8.2](../auth/auth.md#82-cookies-et-stockage-du-navigateur)).

### 2.3 Le quota quotidien

300 mails par jour, partagés entre le formulaire de contact, les réponses depuis Gmail et l'authentification. Atteint, Brevo refuse les suivants : un visiteur qui se connecte par mail ou réinitialise son mot de passe se retrouverait bloqué. Les mails les moins utiles s'arrêtent donc en premier :

| Seuil (variable `MAIL_…`) | Valeur par défaut | Ce qui s'arrête |
|---|---|---|
| `MAIL_REGISTRATION_STOP` | 250 mails | Les inscriptions |
| `MAIL_CONTACT_STOP` | 280 mails | Le formulaire de contact : `contact@` reste affiché pour écrire directement |
| `MAIL_DAILY_LIMIT` | 300 mails | Tout le reste, y compris la connexion |

- **Le décompte vient de Brevo** : `GET /v3/account` donne les envois restants du jour (`plan[].credits`, sur 300), réponses depuis Gmail comprises, et il survit aux déploiements. Le serveur le relit au plus une fois par minute et y ajoute ses propres envois depuis le relevé. Si Brevo ne répond pas, il garde le dernier relevé et compte lui-même, en mémoire.
- **Le site le sait** : `GET /mail/status` (sans connexion) dit quelles fonctions sont ouvertes. Le front le relit toutes les 5 minutes, désactive le formulaire (puis le bouton d'inscription) et affiche un bandeau, empilé sous celui de la console. Tout rouvre seul quand le compteur retombe à zéro.
- **Alerte** : un mail à `contact` (donc dans `perso`) au premier franchissement de chaque seuil du jour, une seule fois par seuil et par jour.
- **Remise à zéro** : Brevo remet les crédits à 300 entre minuit et 1 h (constaté le 2 novembre 2026). Le jour du serveur (heure de Paris, pour l'alerte unique et l'accusé quotidien) peut s'en décaler d'une heure, sans conséquence.

## 3. Réception de contact@

- **Cloudflare Email Routing**, gratuit : une règle `contact` → `perso`. `perso` est d'abord validée par un lien que Cloudflare y envoie. Pas de « catch-all » : toute autre adresse du domaine, `noreply` comprise, est refusée.
- **Le mail transféré garde son expéditeur d'origine** (en-tête `From`) : `perso` voit qui a écrit.
- **Répondre en tant que `contact`** : Gmail « Envoyer des e-mails en tant que » `contact`, par le SMTP de Brevo (§2). Gmail valide l'adresse par un code envoyé à `contact`, qui arrive donc dans `perso`. Réglage « Répondre à partir de l'adresse à laquelle le message a été envoyé » : une réponse à un mail reçu par `contact` part de `contact`, et `perso` n'apparaît nulle part. Ces réponses comptent dans le quota.
- Un filtre Gmail sur `to:contact@alexandre-richard.fr` range tout ce qui passe par `contact` sous un libellé « Contact », jamais en indésirables.

## 4. Formulaire de contact

- **Où** : la page « Contact » de la homepage (`/homepage/contact`), deuxième lien du footer. Sous le formulaire : « Vous pouvez aussi écrire directement à contact@alexandre-richard.fr ». Endpoint : `POST /contact/messages`, `200` avec ce qu'il est advenu de l'accusé de réception (`SENT`, `ALREADY_SENT_TODAY`, `FAILED`, `NO_EMAIL`), que l'écran « Message envoyé » reprend.
- **Champs** : sujet et message obligatoires ; email et nom facultatifs. Longueurs maximales dans les schémas zod de `packages/specs`. Un champ piège caché (honeypot) : rempli, le serveur répond comme un succès et n'envoie rien.
- **À l'envoi**, deux mails, tous les deux de `noreply`, en français, en vouvoiement :

| Mail | Vers | Contenu |
|---|---|---|
| Notification | `contact`, donc `perso` | Objet « [Contact] » + sujet ; nom, email, sujet, message, date. `Reply-To` : l'email du visiteur s'il l'a donné, pour lui répondre d'un clic |
| Accusé de réception, si un email est donné | le visiteur | Message bien reçu, avec son sujet ; prévient qu'un autre message le même jour n'aura pas d'accusé. `Reply-To` : `contact` |

- **L'accusé de réception ne reprend du visiteur que le sujet**, ni le nom, ni le message : sinon, le formulaire servirait à envoyer n'importe quel texte à n'importe quelle adresse, au nom du domaine. Le sujet est court, et un seul accusé part par adresse et par jour.
- **Limites**, pour la réputation du domaine et le quota : par IP, `CONTACT_HOURLY_LIMIT_PER_IP` messages par heure (5), au-delà `429` + `Retry-After` et compte à rebours sur le bouton ; par adresse, un accusé par jour ; plafond global du jour : le seuil `MAIL_CONTACT_STOP` (`403 CONTACT_CLOSED`). En IPv6, la limite vise le `/64`.
- **Notification qui échoue** : le message est gardé en base (`mailing_contact_message_unsent` : sujet, texte, nom, adresse ; jamais l'IP), pour que personne ne soit perdu. Le visiteur voit un succès, et la relance du soir (§6) le renvoie. Si la base échoue aussi : `502 MAIL_UNAVAILABLE`, toast d'erreur avec « Réessayer », texte conservé. Un accusé qui échoue est logué, et le visiteur le sait (`FAILED`), son message étant bien arrivé.
- **Données personnelles** : rien en base hors du cas ci-dessus. Les messages sont à supprimer de `perso` dans la semaine. La page « Données personnelles » dit ce qui est collecté, pourquoi, la durée de conservation, et que le fournisseur d'envoi le voit passer.

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
- **DMARC** : `p=none` (observation), puis `p=quarantine` après deux semaines de rapports propres. Les rapports vont à Brevo (`rua@dmarc.brevo.com`) et se lisent dans son interface.
- **Vérification** : un mail de test arrive en boîte de réception chez Gmail et Outlook, avec SPF, DKIM et DMARC à « pass » dans ses en-têtes, et au moins 7/10 sur mail-tester.

## 6. Côté serveur

- **Expéditeur** : une abstraction à trois versions, choisie par `MAIL_SENDER`. `brevo` en prod (ou en dev, pour un envoi réel) ; `memory` pour les tests ; `journal` en dev par défaut, en pré-prod et en `prod:local`, qui écrit dans le log le type du mail qui serait parti, sans contenu ni adresse. La pré-prod tourne sur `.env.prod` : compose lui impose `journal` et ne lui donne pas la clé ; `prod:local` reçoit une clé factice. Les tests end-to-end gardent `brevo`, mais `BREVO_API_URL` y pointe vers un faux Brevo ([tests end-to-end, §2](../e2e/e2e.md#2-comment-les-mails-sont-captés)).
- **Envoi** pendant la requête, 10 s au plus. Un échec est logué sans contenu ni adresse.
- **Quota** : lecture du compteur de Brevo, seuils, `GET /mail/status`, mail d'alerte (§2.3). Tout mail passe par `mailService`, qui l'envoie et le compte.
- **Échecs en base** : tout envoi refusé par Brevo laisse une ligne dans `mailing_failure` (type du mail, raison, date ; ni adresse ni contenu), effacée après 90 jours. `GET /internal/mail/failures` (7 jours) et `GET /internal/contact/unsent` (messages en attente) donnent leur nombre : Caddy bloque `/api/internal` depuis Internet, le serveur refuse toute requête portant le `X-Real-IP` de Caddy, et la console du NAS l'appelle par le réseau Docker (`SITE_API_URL`). Sa carte « Site » affiche une alerte, sans action (rouge pour un message de contact à lire, orange pour un simple mail perdu) : le détail est en base.
- **Relance du soir** : le job `contact-retry` d'infra-ops (`infra/ops/crontab`, 23 h 50, avant la remise à zéro des crédits de Brevo) appelle `POST /internal/contact/unsent/retry` depuis le conteneur du serveur (`docker exec` : aucun réseau de plus pour infra-ops). Pour chaque message en base, du plus ancien au plus récent : arrêt si `MAIL_CONTACT_STOP` est atteint (le reste attend le soir suivant) ; renvoi de la notification, avec la date d'origine et « (différé) » dans le sujet ; suppression de la ligne ; accusé de réception (un par adresse et par relance, mentionnant le retard). Un refus du fournisseur arrête la relance et fait échouer le job (visible dans la console) ; un accusé refusé est seulement logué. Le bilan (`sentCount`, `remainingCount`, `stoppedBecause`) est affiché par le job.
- **IP réelle** : Caddy écrase l'en-tête `X-Real-IP` avec l'IP qu'il a validée ; le serveur ne lit que lui (`realClientIp`). Les limites par IP en dépendent : derrière Caddy, tous les visiteurs auraient sinon la même IP.
- **`429` + `Retry-After`** de bout en bout : specs, `AppError`, `globalErrorHandler`, `ApiError` du front.
- **Aperçu des gabarits** : le Storybook du design system (`pnpm --filter @citadel/design-system dev`, port 3002, section « Mails », dossier `src/mailPreview`) affiche chaque gabarit comme le reçoit un destinataire : en-têtes, HTML (cadre isolé, clair ou sombre, bureau ou téléphone) et texte brut côte à côte, avec ses variantes. Plus besoin de s'envoyer des mails pour les voir. Les gabarits sont des fonctions pures du serveur, importées telles quelles ; chaque nouveau gabarit y ajoute sa story. Tous partagent la mise en page de `buildMailBodies` (en-tête sombre, briques écrites en HTML et en texte brut, mode sombre et téléphone, sans image ni ressource externe) : un gabarit ne décrit que son contenu.
- **Compteurs en mémoire** (limites par IP et par adresse, alertes déjà envoyées) : une seule instance, remis à zéro à chaque déploiement.

| Variable | Valeur par défaut |
|---|---|
| `MAIL_SENDER` | `journal` (`brevo` en prod) |
| `BREVO_API_KEY` | vide ; obligatoire avec `brevo` (secret) |
| `BREVO_API_URL` | `https://api.brevo.com/v3` (le faux Brevo en e2e) |
| `MAIL_REGISTRATION_STOP`, `MAIL_CONTACT_STOP`, `MAIL_DAILY_LIMIT` | 250, 280, 300 (dans cet ordre, sinon le serveur refuse de démarrer) |
| `CONTACT_HOURLY_LIMIT_PER_IP` | 5 |
| `BREVO_DAILY_CREDITS` | 300 (crédits de l'offre gratuite) |
| `MAIL_QUOTA_READING_SECONDS` | 60 (relevé du compteur de Brevo) |
| `MAIL_FAILURE_RETENTION_DAYS` | 90 |
| `MAIL_FAILURE_WINDOW_DAYS` | 7 (échecs résumés pour la console) |

Elles sont déclarées dans la partie « Mails » d'`env.ts` (zod), `.env.example`, `.env.test` et `infra/compose.yml`.
