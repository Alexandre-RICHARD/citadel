# CI/CD et hébergement sur le NAS — Cahier des charges

[Citadel](../../README.md) › [Hébergement et mise en production](README.md) › Cahier des charges

1er novembre 2026 · v6 : l'hébergement est en place, son mode d'emploi est dans le [README](README.md). Il ne reste que les mails, dernier prérequis du [cahier de l'authentification](../auth/cahier_des_charges.md).

Conventions :
- Dans la roadmap (§5), **[toi]**, **[moi]** ou **[nous]** dit qui fait l'étape.
- Quand tu tranches entre plusieurs options, les autres disparaissent du document.

## Sommaire

- §1 Le besoin
- §2 Envoi
- §3 Réception : `contact@`
- §4 DNS chez Cloudflare
- §5 Roadmap
- §6 Questions ouvertes

---

## 1. Le besoin

- **Envoi** : les mails de l'authentification, depuis `site-prod-server` : inscription, connexion par mail, mot de passe oublié, second facteur, changement d'email, notifications (liste au §8.3 du cahier de l'authentification). Quelques mails par jour au plus.
- **Réception** : `contact@`, l'adresse des pages légales et des demandes sur les données personnelles. Aujourd'hui, ces pages donnent ton adresse Gmail (`CONTACT_EMAIL`, dans `apps/client/src/projects/homepage/content/footerPages.ts`).
- Aucune boîte mail n'existe sur le domaine, et aucune ne sera hébergée sur le NAS.

---

## 2. Envoi

- **Par un fournisseur** (SMTP ou API HTTP), pas directement depuis le NAS : l'IP résidentielle du NAS est listée comme « domestique » par les listes anti-spam, le port 25 sortant est souvent bloqué et il n'y a pas de résolution inverse. Gmail et Outlook classeraient les mails en indésirables, ou les refuseraient.
- **Critères du fournisseur** : hébergé en Europe, offre gratuite suffisante pour quelques mails par jour, domaine vérifié par DNS. Candidats : O2Switch ou Proton, s'ils fournissent un SMTP pour ton domaine ; sinon un service transactionnel européen. Une API HTTP s'appelle avec `fetch`, sans bibliothèque ; un SMTP demande `nodemailer`.
- **Adresse d'envoi** : `noreply@` ton domaine.
- **Identifiants** : créés dans Bitwarden d'abord, puis dans `.env` pour les essais, et dans `.env.prod` à la release de l'authentification. Valeurs quelconques dans `.env.test`, où l'envoi est simulé.
- Le code (expéditeur réel ou en mémoire, gabarits des mails) est dans le cahier de l'authentification (§8).

---

## 3. Réception : `contact@`

- **Cloudflare Email Routing** transfère `contact@` vers ta boîte Gmail : rien à héberger, gratuit.
- Les pages légales donnent ensuite `contact@` (`CONTACT_EMAIL`).
- Email Routing ne fait que recevoir. Une réponse part de ta boîte Gmail, donc avec ton adresse Gmail (§6, Q1).

---

## 4. DNS chez Cloudflare

Tous les enregistrements en « DNS seulement » (nuage gris).

| Enregistrement | Rôle | Qui le crée |
|---|---|---|
| MX | Où arrivent les mails de `contact@` | Email Routing, à son activation |
| SPF (TXT) | Les serveurs autorisés à envoyer pour le domaine | Email Routing, puis le fournisseur d'envoi s'y ajoute |
| DKIM (TXT ou CNAME) | La signature des mails envoyés par le fournisseur | Le fournisseur te les donne |
| DMARC (TXT `_dmarc`) | Ce que fait le destinataire d'un mail qui échoue à SPF et DKIM | Toi : `p=none` d'abord |

- **Un seul enregistrement SPF** par nom : deux enregistrements SPF les rendent tous les deux invalides. Celui d'Email Routing et celui du fournisseur sont fusionnés en un seul, sauf si le fournisseur pose le sien sur un sous-domaine de retour (adresse de rebond).
- **DMARC** : `p=none` (on observe seulement), puis `p=quarantine` deux semaines après la mise en prod de l'authentification, si aucun mail légitime n'échoue (étape 84 du cahier de l'authentification).
- **Critère** : un mail de test arrive en boîte de réception chez Gmail et Outlook, avec SPF, DKIM et DMARC à « pass » dans ses en-têtes.

---

## 5. Roadmap

**Phase 8 — Mails**

1. [toi] Email Routing activé, `contact@` → ta boîte Gmail. Vérif : un mail envoyé depuis une autre adresse arrive.
2. [moi] `CONTACT_EMAIL` → `contact@` dans les pages légales.
3. [nous] Choix du fournisseur d'envoi : comparatif court selon les critères du §2.
4. [toi] Compte chez le fournisseur, domaine vérifié, SPF, DKIM et DMARC `p=none` chez Cloudflare ; identifiants dans Bitwarden, puis dans `.env`.
5. [nous] Envoi de test depuis le fournisseur (son interface ou un `curl`) vers Gmail et Outlook. Vérif : le critère du §4.

---

## 6. Questions ouvertes

- **Q1** : répondre en tant que `contact@` ? Gmail sait envoyer « en tant que » une autre adresse, par le SMTP du fournisseur d'envoi : possible seulement si le fournisseur choisi propose un SMTP. Sinon, les réponses partent de ton adresse Gmail.
