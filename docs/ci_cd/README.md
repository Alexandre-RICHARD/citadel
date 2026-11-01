# Hébergement et mise en production

[Citadel](../../README.md) › Hébergement et mise en production

Le site, son API, la stack média (Jellyfin, qBittorrent, *arr derrière un VPN) et la console d'administration tournent sur le NAS, dans un seul projet Docker Compose (`infra/compose.yml`). Caddy reçoit le trafic web et gère les certificats. Une mise en prod part de ton PC : GitHub construit les images, le NAS les télécharge et les déploie après ta confirmation.

Ce qui reste à faire est dans le [cahier des charges](cahier_des_charges.md).

## Contraintes

- Le NAS ne reçoit que des images, ni git ni Node. Une version est un tag git (`v2026.10.25.01`), porté par toutes les images.
- Une migration passée en prod ne se modifie plus, et le code N-1 doit tourner sur le schéma N : un retour arrière ne touche jamais à la base.
- Aucun secret dans le dépôt, dans une image ou dans une variable `VITE_*`. Bitwarden est la référence ; `.env.prod` vit sur le NAS, dans `/Volume1/citadel/`.
- Seuls le site, `/api` et Jellyfin sont joignables depuis Internet. Le reste (console sur le port 8100, *arr, SSH sur un port à part, MariaDB par tunnel SSH) passe par le LAN ou Tailscale.

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
| `citadel maintenance on\|off` | page de maintenance (503) à la place du site, ou plus |
| `citadel banner "<message>"\|off` | le bandeau du site, ou plus de bandeau |
| `citadel <job>` | lance un job tout de suite : `db-backup`, `db-restore-test`, `config-backup`, `config-verify`, `site-check`, `vpn-leak-test`, `update-check`, `storage-stats`, `qbittorrent-stats`, `auto-stop` |

Mettre à jour une image tierce : changer sa version dans `compose.yml`, commiter, `pnpm release` ; revenir en arrière : `citadel rollback`.

Après une mise à jour de TOS, un conteneur qui ne démarre plus (`Operation not permitted`) se répare en le recréant (`--force-recreate`).

## Accès

Depuis tes appareils. « `:port` » : l'IP du NAS en LAN, son nom (`NAS_HOSTNAME`) par Tailscale, même port des deux côtés. Internet n'atteint que ce que la box redirige : 80 et 443, vers Caddy.

| Service | Adresse | Internet | LAN, Tailscale | Connexion |
|---|---|---|---|---|
| Site (`www` redirigé) | `https://alexandre-richard.fr`, par Cloudflare | ✅ | ✅ par le domaine | aucune |
| API | `https://alexandre-richard.fr/api` | ✅ lectures et écritures, comme aujourd'hui | ✅ | aucune (plus bas) |
| Jellyfin | `https://jellyfin.alexandre-richard.fr` ; `:8096` en direct | ✅ par le domaine | ✅ les deux | comptes Jellyfin |
| qBittorrent, Prowlarr, Radarr, Sonarr, Bazarr, cross-seed | `:8080`, `:9696`, `:7878`, `:8989`, `:6767`, `:2468` | ❌ | ✅ | la leur, inchangée : leurs réglages suivent leurs dossiers |
| Console | `http://…:8100` | ❌ | ✅ | son mot de passe |
| Pré-prod | `http://…:8002`, servie par Caddy | ❌ | ✅ | aucune |
| Interface de TOS | ses ports habituels | ❌ jamais | ✅ | compte TOS |
| SSH | son port, dans ton `~/.ssh/config` | ❌ jamais | ✅ | clé seulement |
| MariaDB, prod et pré-prod | `127.0.0.1:3306` et `3307` du NAS | ❌ | tunnel SSH | comptes plus bas |
| API Docker | socket du NAS | ❌ | ❌ | `infra-ops` ; la console à travers `infra-socket-proxy` |

- API : sans authentification, rien ne distingue ton front d'un script ; n'importe qui peut appeler les routes d'écriture. Accepté jusqu'à ton chantier d'authentification.
- Console en HTTP, sans certificat à installer sur chaque appareil : par Tailscale, WireGuard chiffre tout ; en LAN, le mot de passe ne traverse que ton réseau domestique. Accepté.

## La base depuis DBeaver

- MariaDB écoute sur `127.0.0.1:3306` du NAS (pré-prod : `3307`) : invisible depuis le réseau, joignable seulement depuis le NAS lui-même, donc par un tunnel SSH.
- DBeaver, onglet SSH : hôte : son nom Tailscale, port : celui de SSH, ton utilisateur, ta clé. Onglet principal : hôte `127.0.0.1`, port `3306`, base `citadel`, compte `citadel_migrator`.
- Le SSH de TOS autorise les tunnels : `AllowTcpForwarding` garde sa valeur par défaut.

| Compte | Pour | Droits |
|---|---|---|
| `citadel_app` | le serveur | lire et écrire les données |
| `citadel_migrator` | Flyway, et toi dans DBeaver | structure et données de `citadel`, rien d'autre |
| `citadel_backup` | les dumps | lecture seule |
| `root` | dépannage | seulement depuis l'intérieur du conteneur |

Mêmes comptes en pré-prod, avec des droits sur `citadel_preprod` seulement.

## Réglages hors du dépôt

Aucun fichier ne les contient : à refaire si le NAS, la box ou le PC change, et à revérifier après une mise à jour de TOS.

| Où | Réglage |
| --- | --- |
| Box | vers le NAS, seulement TCP 80 → 8001 et 443 → 4443 ; UPnP désactivé ; bail DHCP statique pour le NAS |
| Tailscale | expiration de clé désactivée pour le NAS |
| TOS, `/etc/ssh/sshd_config` | `PermitRootLogin prohibit-password`, `PasswordAuthentication no`, `KbdInteractiveAuthentication no` |
| TOS, dossier personnel | droits `755` (en `777`, SSH refuse la clé) |
| PC | clé `~/.ssh/nas` avec phrase de passe ; alias `nas` : nom Tailscale du NAS, port de SSH, `IdentitiesOnly yes` |

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

## Alertes (healthchecks.io)

Les jobs suivis (`site-check`, `db-backup`, `db-restore-test`, `config-backup`, `config-verify`, `vpn-leak-test`) signalent leur début, leur réussite ou leur échec à healthchecks.io, qui alerte par e-mail et sur Discord si un job échoue **ou ne passe pas à l'heure**. Chaque contrôle (une ligne dans la liste de ton projet healthchecks.io) se crée seul, au premier signal du job, sous son nom.

1. healthchecks.io → ton projet → Settings → API Access → « Ping key » : la générer, la ranger dans Bitwarden, puis l'écrire dans `.env.prod` (`HEALTHCHECKS_PING_KEY`), avant le déploiement.
2. Après le déploiement, faire passer chaque job une fois, pour que son contrôle apparaisse : dans la console (`http://…:8100`), section « Jobs », le bouton ▶ de chaque ligne ; ou depuis ton PC, `ssh nas /Volume1/citadel/citadel db-backup` (puis les autres noms).
3. healthchecks.io ne sait pas encore **quand** attendre chaque job : par défaut, une fois par jour. Pour `site-check`, une panne ne serait donc signalée qu'au bout d'un jour. Sur chaque contrôle : cliquer dessus → « Change Schedule » → onglet « Cron » → coller l'expression du tableau, fuseau `Europe/Paris`, le délai de grâce (le retard toléré avant l'alerte) → Save. Ces expressions sont celles de `infra/ops/crontab` : à reporter ici si elles y changent.

| Contrôle | Cron | Délai de grâce |
|---|---|---|
| `site-check` | `*/5 * * * *` | 10 min |
| `db-backup` | `0 5 * * *` | 30 min |
| `db-restore-test` | `0 5 * * *` | 1 h |
| `config-backup` | `0 3 * * 1` | 1 h |
| `config-verify` | `0 3 * * 1` | 2 h |
| `vpn-leak-test` | `30 4 * * *` | 1 h |

## Accès au Drive (rclone)

Les sauvegardes partent sur ton Google Drive, chiffrées par rclone. Deux « remotes » dans `rclone.conf` : `gdrive` (le dossier `citadel` de ton Drive) et `citadel-backups` (le même dossier, chiffré : noms et contenus illisibles sans le mot de passe et le sel).

Pourquoi ça tient : un client OAuth à toi, publié **en production**. En mode « test », Google coupe le jeton au bout de 7 jours (la cause probable des pannes d'avant). La portée `drive.file` ne donne accès qu'aux fichiers créés par rclone : pas de vérification Google à demander, et rien d'autre de ton Drive n'est lisible. Le jeton ne meurt ensuite que si tu le révoques, ou après 6 mois sans servir.

Accès limité au seul dossier `citadel`, en deux couches : Google (`drive.file`) cache à rclone tout ce qu'il n'a pas créé ; rclone (`root_folder_id`) prend `citadel` pour racine, et aucune commande ne peut en sortir.

**1. Client OAuth**, sur <https://console.cloud.google.com>, connecté au compte Google du Drive. Tout ce qui s'affiche une seule fois va dans Bitwarden **avant** de passer à la suite.

1. Sélecteur de projet → Nouveau projet → `citadel-rclone` → Créer, puis le sélectionner.
2. API et services → Bibliothèque → « Google Drive API » → Activer.
3. Google Auth Platform → Commencer : nom `citadel-rclone`, ton email ; audience **Externe** ; ton email en contact ; accepter → Créer.
4. Accès aux données → Ajouter ou supprimer des champs d'application → filtrer `drive.file` → cocher `.../auth/drive.file` → Mettre à jour → Enregistrer.
5. Branding : ton email en assistance, l'adresse du site en page d'accueil **et** en règles de confidentialité (Google ne vérifie pas ces pages avec `drive.file`), pas de logo (il déclencherait une vérification) → Enregistrer.
6. Audience → **Publier l'application** → Confirmer. Le statut doit être « En production ».
7. Clients → Créer un client → type **Application de bureau**, nom `rclone` → Créer. Copier l'ID client et le code secret dans Bitwarden (le secret n'est plus réaffiché).

**2. Remotes**, sur ton PC. Installer rclone (`winget install Rclone.Rclone`), ouvrir un nouveau terminal, puis `rclone config` :

1. `n` (nouveau remote), nom `gdrive`, type `drive`, `client_id` et `client_secret` collés, `scope` : `drive.file`, `service_account_file` vide, configuration avancée `n`, navigateur `y`. Choisir le compte ; si Google affiche « Google n'a pas validé cette application » : Paramètres avancés → Accéder à citadel-rclone → Continuer. « Success » s'affiche. Shared Drive `n`, garder `y`, puis `q`.
2. Enfermer `gdrive` dans le dossier `citadel`, dans Git Bash :
   ```sh
   rclone mkdir gdrive:citadel
   ID=$(rclone lsjson gdrive: --dirs-only | jq -r '.[] | select(.Name == "citadel") | .ID')
   echo "$ID"                                   # attendu : une suite de lettres et de chiffres
   rclone config update gdrive root_folder_id "$ID"
   rclone lsd gdrive:                           # attendu : rien (on est dans citadel, vide)
   ```
   (`jq` absent : `winget install jqlang.jq`.) Puis relancer `rclone config`, pour créer le remote chiffré :
3. `n`, nom `citadel-backups`, type `crypt`, `remote` : `gdrive:`, `filename_encryption` et `directory_name_encryption` par défaut (Entrée) : changés au 5.
4. `password` : `g` (générer), 256 bits, `y`. **Copier le mot de passe dans Bitwarden tout de suite.** `password2` (le sel) : pareil. Configuration avancée `n`, garder `y`, puis `q`.
5. Des noms lisibles sur le Drive, seul le contenu est chiffré (et pas de `.bin` ajouté) : `rclone config update citadel-backups filename_encryption off directory_name_encryption false suffix none`.
6. Le fichier entier (`rclone config file` donne son chemin) va aussi dans Bitwarden.

**3. Vérifier**, dans Git Bash : créer un fichier lisible, l'envoyer chiffré, le relire sans aide (juste les secrets) :

```sh
# 1. Créer un fichier avec du texte que tu reconnaîtras
echo "test de la citadel" > verification.txt

# 2. L'envoyer sur le Drive (via rclone, il sera chiffré)
rclone copy verification.txt citadel-backups:verify/

# 3. ⚠️  Va observer sur ton Drive (https://drive.google.com)
#    Le fichier garde son nom, mais son contenu est illisible : c'est le chiffrement.

# 4. Relire le fichier en clair via rclone (en utilisant la config citadel-backups)
echo "--- Via citadel-backups (normal) ---"
rclone cat citadel-backups:verify/verification.txt

# 5. Relire le MÊME fichier JUSTE avec tes secrets Bitwarden
#    (pas de config rclone, pas de NAS : juste les deux codes de Bitwarden)
#    Cela prouve que tu peux récupérer tes données en cas de catastrophe.
echo "--- Avec JUSTE les secrets (mode urgence) ---"
read -rsp "Mot de passe (depuis Bitwarden) : " PW; echo
read -rsp "Sel (depuis Bitwarden) : " SALT; echo
rclone cat ":crypt,remote='gdrive:',password='$(rclone obscure "$PW")',password2='$(rclone obscure "$SALT")',filename_encryption=off,directory_name_encryption=false,suffix=none:verify/verification.txt"
unset PW SALT

# 6. Nettoyer
rclone purge citadel-backups:verify/
rm verification.txt
echo "Vérification terminée ✓"
```

**4. Sur le NAS**, depuis Git Bash sur ton PC (pas PowerShell : `<` et `$APPDATA` n'y marchent pas). Cela copie le fichier de config depuis ton PC vers le NAS, avec des permissions très restrictives (seul le propriétaire peut le lire) :

```sh
# 1. Copier le fichier de ton PC vers le NAS, via SSH
ssh nas 'umask 077 && cat > /Volume1/citadel/rclone.conf' < "$APPDATA/rclone/rclone.conf"
```

Ça se décompose ainsi :
- `ssh nas` : se connecter au NAS en SSH
- `umask 077` : les permissions par défaut vont être `rw-------` (seul le propriétaire lit/écrit)
- `cat > /Volume1/citadel/rclone.conf` : écrire ce qui arrive sur l'entrée standard dans ce fichier
- `< "$APPDATA/rclone/rclone.conf"` : lire depuis ton fichier rclone local (Windows)

```sh
# 2. Vérifier que le fichier est bien là, avec les bonnes permissions
ssh nas ls -l /Volume1/citadel/rclone.conf
```

Attendu : `-rw-------` (seul le propriétaire lit/écrit, personne d'autre n'y voit rien, même les autres utilisateurs du NAS).

**Note** : `infra-ops` (le conteneur des jobs) relira ce fichier, et le réécrit quand le jeton OAuth de Google doit être renouvelé (normal, aucune action de ta part).

**Si un jour le Drive refuse** (`invalid_grant`, jeton expiré ou révoqué) : sur ton PC, `rclone config reconnect gdrive:`, puis refaire l'étape 4. Le chiffrement ne change pas : rien n'est perdu.

**Déchiffrer un fichier téléchargé du Drive**, sans NAS ni `rclone.conf` : juste rclone, le mot de passe et le sel de Bitwarden. Sur drive.google.com, dans `citadel`, télécharger le fichier voulu (`db/daily/citadel-…sql.zst`, par exemple) **sans le renommer**. Puis, dans Git Bash :

```sh
cd ~/Downloads
mkdir -p chiffre clair
mv citadel-<…téléchargé> chiffre/               # un ou plusieurs fichiers
read -rsp "Mot de passe (Bitwarden) : " PW; echo
read -rsp "Sel (Bitwarden) : " SALT; echo
rclone copy ":crypt,remote='chiffre',password='$(rclone obscure "$PW")',password2='$(rclone obscure "$SALT")',filename_encryption=off,directory_name_encryption=false,suffix=none:" clair
unset PW SALT
ls clair                                        # attendu : le même nom, contenu lisible
```

Ensuite : un dump (`.sql.zst`) se décompresse avec `zstd -d <fichier>` (`winget install Meta.Zstandard`), et la console sait le restaurer tel quel (« Restaurer la base » → « Un dump envoyé depuis ce PC »). Une archive des configs (`.tar.zst`) s'ouvre avec `tar --zstd -xf <fichier>`. Sans rien télécharger, rclone lit aussi le Drive directement : `rclone ls ":crypt,remote='gdrive:',password=…,password2=…,filename_encryption=off,…:"` liste tout, et `rclone copy` du même remote suivi de `:db/daily/<nom en clair>` récupère un fichier (même syntaxe que l'étape 3).

## Remonter le NAS de zéro

Garder dans Bitwarden `.env.prod`, `rclone.conf`, le mot de passe et le sel du chiffrement des sauvegardes, et les accès Google, GitHub, Tailscale, Proton, Cloudflare, O2Switch et TOS. Puis : installer TOS et Docker, puis `citadel` dans `/Volume1/citadel` ; y déposer `.env.prod` et `rclone.conf` ; restaurer la dernière archive dans `/Volume1/appdata` ; `citadel deploy <dernière version>` ; `citadel restore-db latest`.
