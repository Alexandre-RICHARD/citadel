# Console d'administration

[Citadel](../../README.md) › Console d'administration

La console de l'hébergement, dans `apps/admin` : l'état du NAS, des services, des sauvegardes et du site, et les actions qu'on peut y lancer. Elle n'est jamais joignable depuis Internet. Son déploiement, ses accès et les jobs qu'elle lance sont dans l'[infra](../infra/infra.md) ; ce qui reste à faire est dans le [todo](../todo/todo.md#46-console).

## Sommaire

1. [Fonctionnement](#1-fonctionnement)
2. [Sécurité](#2-sécurité)
3. [Code](#3-code)
4. [Lancer](#4-lancer)

## 1. Fonctionnement

- Une seule page, servie par un serveur Express (port 8100 sur le NAS, `ADMIN_PORT`), dont le front relit chaque route à intervalle régulier, seulement quand l'onglet est visible (onglet caché, la console ne demande rien au NAS).
- **Elle n'a pas de base de données.** Elle lit : l'API Docker, par un filtre (`infra-socket-proxy`), jamais le socket lui-même ; qBittorrent, Gluetun et Jellyfin par leurs API ; les logs d'accès et les certificats de Caddy ; le dossier `state/` du NAS, en lecture seule (version en service, historiques, jobs, sauvegardes, résultats des demandes) ; l'espace libre de chaque disque ; et, sur le site, le nombre de mails en échec et de messages de contact en attente (`/internal`, par le réseau Docker).
- **Sa seule écriture** est le dépôt d'une demande dans `state/queue/` : `infra-ops` la vérifie (liste fermée d'actions et de versions) puis l'exécute. Une faille dans la console ne donne donc ni les pleins droits sur Docker, ni l'accès au Drive ([infra, §1](../infra/infra.md#1-fonctionnement)).
- **Ce qu'elle montre** : le système, le VPN, les torrents, l'état du site et son trafic, le stockage, les échéances (certificats, abonnements), les jobs et leur planning, les accès (Caddy et Jellyfin), les services par groupe avec leurs limites et leurs logs, et les versions des images.
- **Ce qu'elle permet** : démarrer, arrêter et relancer un service ou un groupe, lancer un job tout de suite, déployer une version, restaurer la base, gérer les sauvegardes, poser le bandeau du site et le mode maintenance. Toute action passe par une demande, avec confirmation, dont le résultat se suit à l'écran.

## 2. Sécurité

- **Connexion** : un seul mot de passe, gardé sous forme de hash argon2id (`ADMIN_PASSWORD_HASH`, fabriqué par `citadel admin-password` ou `pnpm tools hashAdminPassword`). Cinq essais par adresse IP sur un quart d'heure, puis refus ; un succès efface le compteur.
- **Session** : un cookie (`citadel_admin_session`) vers un jeton gardé en mémoire, valable 12 heures. Un redémarrage de la console déconnecte.
- **Origine** : toute requête `/api` doit venir de la page de la console elle-même (`requireSameOrigin`) : un autre site ouvert dans votre navigateur ne peut pas lancer d'action à votre place.
- **En-têtes** : la console ne charge que ses propres fichiers, ne s'affiche dans aucune autre page et n'envoie pas son adresse aux liens suivis (CSP, `X-Frame-Options`, `Referrer-Policy`).
- **Journal** : une ligne JSON par connexion ou action dans les logs du conteneur (`docker logs infra-admin`, ou la console elle-même).
- Pas de HTTPS propre : l'accès passe par le LAN ou Tailscale, dont WireGuard chiffre tout ([infra, §5](../infra/infra.md#5-accès)).

## 3. Code

```
apps/admin/src/
├── server/    Express : un dossier par source (docker, torrent, vpn, access, deadlines, jobs, operations, requests,
│              services, site, state, storage, system, tailscale), auth/, http/ et configuration/env.ts
├── client/    React avec le design system : api/, components/ (une carte ou une section par composant), status/
└── shared/    les types échangés entre le serveur et le client, et les petites fonctions qu'ils partagent
```

- Un seul paquet et un seul `tsconfig`. `vite build` construit le front dans `build/public`, que le serveur sert, et `esbuildConfig.mjs` regroupe le serveur.
- `configuration/env.ts` lit et vérifie toutes les variables au démarrage ; elles viennent de `infra/compose.yml` (service `infra-admin`) pour les adresses, de `.env.prod` pour les secrets. Une variable invalide arrête le serveur avec la liste de ce qui manque.
- Le thème de la console est `client/adminTheme.ts` ; ses composants viennent du [design system](../designSystem/designSystem.md).
- Tests unitaires : `pnpm --filter @citadel/admin test-unit`.

## 4. Lancer

Sur le NAS, la console est un conteneur de `infra/compose.yml`. En local, `pnpm prod:local` lance la stack complète, console comprise, sur http://localhost:8100. Pour travailler son interface sans reconstruire l'image : `pnpm --filter @citadel/admin dev:local` lance le front sur http://localhost:3003, branché sur la console de `prod:local` (le proxy se présente avec l'origine de celle-ci).
