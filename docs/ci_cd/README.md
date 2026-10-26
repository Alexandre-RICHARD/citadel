# Hébergement et mise en production

[Citadel](../../README.md) › Hébergement et mise en production

Le site, son API, la stack média (Jellyfin, qBittorrent, *arr derrière un VPN) et la console d'administration tournent sur le NAS `leodinas`, dans un seul projet Docker Compose (`infra/compose.yml`). Caddy reçoit le trafic web et gère les certificats. Une mise en prod part de ton PC : GitHub construit les images, le NAS les télécharge et les déploie après ta confirmation.

La cible, les choix et la roadmap sont dans le [cahier des charges](cahier_des_charges.md).

## Contraintes

- Le NAS ne reçoit que des images, ni git ni Node. Une version est un tag git (`v2026.10.25`), porté par toutes les images.
- Une migration passée en prod ne se modifie plus, et le code N-1 doit tourner sur le schéma N : un retour arrière ne touche jamais à la base.
- Aucun secret dans le dépôt, dans une image ou dans une variable `VITE_*`. Bitwarden est la référence ; `.env.prod` vit sur le NAS, dans `/Volume1/citadel/`.
- Seuls le site, `/api` et Jellyfin sont joignables depuis Internet. Le reste (console sur le port 8100, *arr, SSH sur le 9222, MariaDB par tunnel SSH) passe par le LAN ou Tailscale.

## Prérequis

- Sur ton PC : Docker Desktop, Git Bash (le `bash` de PowerShell serait celui de WSL, sans tes clés SSH), et l'alias `nas` de `~/.ssh/config`.
- Sur le NAS : Docker, la commande `citadel` et `.env.prod`, rempli depuis `.env.example`.

## Commandes

Sur ton PC :

| Commande | Effet |
| --- | --- |
| `pnpm prod:local` | les images de prod sur ton PC, stack média comprise : https://citadel.localhost:8443, la console sur http://localhost:8100 |
| `pnpm prod:local:down` | arrête tout et efface les volumes jetables |
| `pnpm release` | valide, tague, pousse, attend les images, puis lance le déploiement sur le NAS, qui montre son plan et attend ton « o » |
| `pnpm release --dry-run` | s'arrête juste avant le tag : rien ne part |
| `pnpm admin:password` | hachage du mot de passe de la console, pour `ADMIN_PASSWORD_HASH` |

Sur le NAS (`ssh nas`), en secours de la console :

| Commande | Effet |
| --- | --- |
| `citadel status` | état des services, version en service |
| `citadel start\|stop\|restart <cible>` | un service (`site-prod-server`) ou un groupe (`media`) |
| `citadel logs <service>` | 200 dernières lignes, puis la suite en direct |
| `citadel up` | relance tout ce qui doit toujours tourner |
| `citadel deploy <version>` | déploie une version : plan, confirmation, dump, migrations, vérifications, retour arrière automatique en cas d'échec |
| `citadel rollback` | revient à la version précédente |
| `citadel restore-db pre-deploy` | remet la base d'avant le dernier déploiement (puis `citadel rollback`) |

Après une mise à jour de TOS, un conteneur qui ne démarre plus (`Operation not permitted`) se répare en le recréant (`--force-recreate`).

## Réglages hors du dépôt

Aucun fichier ne les contient : à refaire si le NAS, la box ou le PC change, et à revérifier après une mise à jour de TOS.

| Où | Réglage |
| --- | --- |
| Bbox | vers le NAS, seulement TCP 80 → 8001 et 443 → 4443 ; UPnP désactivé ; bail DHCP statique `192.168.1.113` |
| Tailscale | expiration de clé désactivée pour `leodinas` |
| TOS, `/etc/ssh/sshd_config` | `PermitRootLogin prohibit-password`, `PasswordAuthentication no`, `KbdInteractiveAuthentication no` |
| TOS, dossier personnel | droits `755` (en `777`, SSH refuse la clé) |
| PC | clé `~/.ssh/nas` avec phrase de passe ; alias `nas` : `leodinas`, port 9222, `IdentitiesOnly yes` |

```sh
# ----- Sur le NAS, dans le terminal web de TOS : il marche même si SSH est cassé -----
/usr/sbin/sshd -T | grep -iE '^(passwordauthentication|kbdinteractiveauthentication|permitrootlogin) '
#   attendu : permitrootlogin without-password, passwordauthentication no, kbdinteractiveauthentication no
ls -ld ~                                        # attendu : drwxr-xr-x ; sinon chmod go-w ~
docker exec tailscale tailscale ping <téléphone>  # téléphone en 4G ; attendu : « via <IP>:<port> » (direct), pas « via DERP »

# ----- Sur le PC, dans Git Bash -----
ssh nas echo ok                                 # attendu : phrase de passe de la clé, puis ok
ssh -o PubkeyAuthentication=no nas echo ok      # attendu : Permission denied (publickey), sans demande de mot de passe
pnpm prod:local                                 # attendu : 15 conteneurs « Healthy » ; puis pnpm prod:local:down
pnpm release --dry-run                          # attendu (tout commité) : validation, résumé, arrêt avant le tag
```

## Remonter le NAS de zéro

Garder dans Bitwarden `.env.prod`, `rclone.conf`, le mot de passe et le sel du chiffrement des sauvegardes, et les accès Google, GitHub, Tailscale, Proton, Cloudflare, O2Switch et TOS. Puis : installer TOS et Docker, puis `citadel` dans `/Volume1/citadel` ; y déposer `.env.prod` et `rclone.conf` ; restaurer la dernière archive dans `/Volume1/appdata` ; `citadel deploy <dernière version>` ; `citadel restore-db latest`.
