# CI/CD et hébergement sur le NAS — Cahier des charges

[Citadel](../../README.md) › [Hébergement et mise en production](README.md) › Cahier des charges

1er novembre 2026 · v9 : Brevo retenu (essai), quota quotidien surveillé · v8 : accusé de réception avec le sujet, réponses en tant que `contact`, messages gardés une semaine · v7 : adresses, formulaire de contact, roadmap complète · v6 : l'hébergement est en place, son mode d'emploi est dans le [README](README.md). Il ne reste que les mails, dernier prérequis du [cahier de l'authentification](../auth/cahier_des_charges.md).

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

- **Le décompte vient de Brevo**, pas du serveur : `GET /v3/account` donne les envois restants du jour (`plan[].credits`, sur 300), ceux de tes réponses depuis Gmail compris, et il survit aux déploiements. Le serveur le relit au plus une fois par minute et garde la valeur en cache. Si Brevo ne répond pas, il compte lui-même ses envois, en mémoire. Les statistiques du jour (`GET /v3/smtp/statistics/aggregatedReport`) servent de repli.
- **Le site le sait** : un endpoint sans connexion (`GET /mail/status`) dit quelles fonctions sont ouvertes. Le front désactive le bouton d'inscription ou le formulaire, et affiche le bandeau du site (même composant que le mode maintenance) : « Les inscriptions sont fermées pour aujourd'hui, elles rouvrent demain. Tu peux toujours te connecter. » Il rouvre tout seul quand le compteur retombe à zéro.
- **Tu es prévenu**: un mail à `contact` (donc dans `perso`) au premier franchissement de chaque seuil du jour, une fois seulement par seuil et par jour. Pour la fermeture totale, c'est le dernier mail que Brevo laisse partir : le seuil d'alerte est un peu sous la limite.
- **À vérifier** : à quelle heure Brevo remet les crédits à 300 (compte en heure de Paris ; relevé le 2 novembre au matin). La réouverture du site suit ce compteur.
- **Suivi anonymisé, pas supprimé** : l'offre gratuite de Brevo ne permet pas de le couper sur les mails transactionnels. Il garde un pixel d'ouverture et réécrit les liens par `r.mail.alexandre-richard.fr` (notre sous-domaine, mais Brevo les voit passer). Réglage « Suivi anonyme » sur Oui dans Brevo, et `contactPixelTrackingConsent: false` dans chaque envoi. Acceptable pour l'essai : le lien d'un mail de connexion ne sert que dans le navigateur qui a commencé le parcours, et le code est à usage unique. À annoncer sur la page « Données personnelles ». Si ça pèse au moment de l'authentification, c'est un critère pour changer de fournisseur.
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

- **Où** : une rubrique « Contact » dans le footer, une page de la homepage comme « À propos » ou « Mentions légales », avec le formulaire. Sous le formulaire : « Tu peux aussi écrire à contact@alexandre-richard.fr ».
- **Champs** : sujet et message obligatoires ; email et nom facultatifs. Longueurs maximales dans les schémas zod de `packages/specs`. Un champ piège caché (honeypot) : rempli, le serveur répond comme un succès et n'envoie rien.
- **À l'envoi**, deux mails, tous les deux de `noreply` :

| Mail | Vers | Contenu |
|---|---|---|
| Notification | `contact`, donc `perso` | Objet « [Contact] » + sujet ; nom, email, sujet, message, date. `Reply-To` : l'email du visiteur s'il l'a donné, pour lui répondre d'un clic |
| Accusé de réception, si un email est donné | le visiteur | Message bien reçu, avec son sujet ; réponse à cette adresse. En bas : « Si vous remplissez un autre formulaire de contact dans la même journée, vous ne recevrez pas d'autre accusé de réception. » `Reply-To` : `contact` |

- **L'accusé de réception ne reprend du visiteur que le sujet**, ni le nom, ni le message : sinon, le formulaire servirait à envoyer n'importe quel texte à n'importe quelle adresse, au nom du domaine. Le sujet est court (longueur maximale dans les specs), et un seul accusé par adresse et par jour.
- **Limites**, pour la réputation du domaine et le quota du fournisseur (que l'authentification partagera) : par IP, un nombre de messages par heure ; par adresse, un accusé de réception par jour au plus ; un plafond global par jour. Au-delà : `429` + `Retry-After`, compte à rebours sur le bouton. Les valeurs sont des variables d'environnement.
- Texte brut, en français, pour les deux mails.
- **Rien en base** : le message n'existe que dans les mails. Tu supprimes les messages de `perso` dans la semaine. La page « Données personnelles » dit ce qui est collecté, pourquoi, que c'est gardé une semaine au plus, et que le fournisseur d'envoi le voit passer.

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

- **Expéditeur** : une abstraction, avec trois versions. Réelle (le fournisseur) en prod ; en mémoire pour les tests ; « journal » en dev sans clé et en pré-prod, qui écrit dans le log qu'un mail serait parti, sans son contenu. La pré-prod tourne sur `.env.prod` : sans ce réglage, elle enverrait de vrais mails.
- Envoi pendant la requête, 10 s au plus. Un échec est logué sans contenu (ni message, ni adresse) ; le visiteur voit une erreur et garde son texte dans le formulaire.
- **IP réelle** : Caddy écrase un en-tête `X-Real-IP` avec l'IP qu'il a validée ; le serveur ne lit que lui (cahier de l'authentification, §7.2). Les limites du formulaire en dépendent : derrière Caddy, tous les visiteurs ont sinon la même IP.
- **`429` + `Retry-After`** de bout en bout : specs, `AppError`, `globalErrorHandler`, `ApiError` du front.
- **Quota** : lecture du compteur de Brevo, seuils, `GET /mail/status`, mail d'alerte (§2).
- Compteurs des limites par IP et par adresse en mémoire (une seule instance), remis à zéro à chaque déploiement.
- Variables dans la section `mail` d'`env.ts` (zod), dans `.env.example` (`[secret]` devant la clé), `.env.test`, et `infra/compose.yml` (`site-prod-server`, `site-preprod-server`).

---

## 7. Roadmap

Chaque étape [moi] est un commit relisible, avec ses tests ; `pnpm validate-all` passe à chaque commit. Je te donne le pas-à-pas de chaque étape [toi] au moment de la faire.

**Phase 1 — Réception**

1. [toi] Filtre Gmail : `to:contact@alexandre-richard.fr` → libellé « Contact », jamais en indésirables.

**Phase 2 — Envoi**

2. [toi] Gmail : « Envoyer des e-mails en tant que » `contact`, par le SMTP du fournisseur ; réponse depuis l'adresse de réception. Vérif : une réponse à un mail reçu par `contact` arrive de `contact`, sans `perso` dans ses en-têtes.

**Phase 3 — Socle serveur**

3. [moi] `429` + `Retry-After` : specs, `AppError`, `globalErrorHandler`, `ApiError` du front.
4. [moi] IP réelle : `header_up X-Real-IP` dans Caddy, middleware qui ne lit que cet en-tête. Vérif : IP du client dans un log en `prod:local`.
5. [moi] Expéditeur réel, en mémoire et « journal » ; section `mail` d'`env.ts` ; `.env.example`, `.env.test`, `compose.yml`.
6. [moi] Quota : lecture du compteur de Brevo (cache d'une minute, repli sur un compte local), seuils, mail d'alerte une fois par seuil et par jour, `GET /mail/status`. Vérif : tests avec un compteur simulé, seuils franchis dans l'ordre.
7. [nous] Envoi réel depuis le dev vers Gmail et Outlook. Vérif : le critère du §5.

**Phase 4 — Formulaire de contact**

8. [moi] Specs : `POST /contact`, schémas et codes d'erreur.
9. [moi] Serveur : honeypot, limites, notification et accusé de réception. Vérif : tests d'intégration avec l'expéditeur en mémoire.
10. [moi] Front : rubrique « Contact » du footer, page et formulaire (envoi, succès, compte à rebours du `429`, erreur sans perte du texte), adresse `contact` en dessous.
11. [moi] Front : `GET /mail/status` lu au chargement ; formulaire de contact désactivé et bandeau du site quand il est fermé (l'inscription fera de même, cahier de l'authentification). Vérif : seuil abaissé en `.env` de dev, bandeau et boutons désactivés, réouverture au retour sous le seuil.
12. [moi] Page « Données personnelles » : le formulaire de contact (§4).
13. [toi] Recette visuelle en dev, puis en `pnpm prod:local`.

**Phase 5 — Mise en prod**

14. [toi] Clé d'API dans `.env.prod`, depuis Bitwarden.
15. [nous] `pnpm release`, puis en prod : un message avec email, un sans, un mail direct à `contact`. Vérif : notifications et accusé de réception reçus en boîte de réception, expéditeurs visibles dans `perso`, une réponse à l'accusé arrive dans `perso`, ta réponse au visiteur part de `contact`.
16. [toi] Deux semaines plus tard, rapports DMARC propres : `p=quarantine`.

---

## 8. Questions ouvertes

Aucune.
