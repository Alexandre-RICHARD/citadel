# syntax=docker/dockerfile:1
# =====================================================================================
# Dockerfile : TOUTES les images de Citadel, une étape (« target ») par image
# =====================================================================================
#
# Une image = une étape finale de ce fichier, choisie à la construction :
#   docker build --target server --build-arg APP_VERSION=v2026.10.25 .
#
#   client      le front (build Vite) servi par nginx, avec les relais /irigo et /igdb
#   server      l'API Express : Node et un seul fichier JavaScript (bundle esbuild)
#   migrations  Flyway et les migrations SQL de cette version
#   caddy       la porte d'entrée web (HTTPS, routage), avec notre Caddyfile
#   ops         les outils du NAS : la commande citadel, compose.yml, le script d'init de la
#               base, le planning des jobs d'infra-ops
#
# Les étapes intermédiaires (workspace, client-build, server-build…) ne deviennent pas
# des images : elles préparent les fichiers que les étapes finales copient.
#
# Qui construit ?
#   - GitHub (.github/workflows/images.yml), à chaque tag v*, pour le NAS ;
#   - ton PC, avec `pnpm prod:local`, pour tester avant une release.
#
# Le contexte de build est la racine du dépôt, filtrée par .dockerignore (jamais de .env).
#
# Ordre des instructions : Docker garde en cache chaque étape tant que ce qu'elle lit
# n'a pas changé. On place donc en premier ce qui change rarement (dépendances), en
# dernier ce qui change souvent (le code, la version) : une release ne refait que la fin.

# --- Versions des images de base, écrites une seule fois ---
# Node 24 : maintenu jusqu'en avril 2028. « alpine » : une petite distribution Linux.
ARG NODE_IMAGE=node:24.22.1-alpine3.24
ARG FLYWAY_IMAGE=flyway/flyway:12.11.0-alpine
# nginx sans root : écoute sur 8080 au lieu de 80, tourne avec l'utilisateur nginx (101)
ARG NGINX_IMAGE=nginxinc/nginx-unprivileged:1.31.7-alpine3.24
ARG CADDY_VERSION=2.11.7
ARG ALPINE_IMAGE=alpine:3.24.3

# =====================================================================================
# workspace : le dépôt et ses dépendances téléchargées (commun au front et au serveur)
# =====================================================================================
FROM ${NODE_IMAGE} AS workspace

# pnpm est fourni par corepack, inclus dans Node : il lit la version exacte de pnpm dans
# le champ packageManager du package.json (et vérifie son empreinte). Pas de question posée.
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable

WORKDIR /repo

# 1. Seulement les fichiers qui décrivent les dépendances…
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
# 2. …puis le téléchargement de TOUTES les dépendances du lockfile, sans rien installer.
#    Cette couche reste en cache tant que pnpm-lock.yaml ne change pas : quelques
#    secondes au lieu d'une minute à chaque release.
RUN pnpm fetch
# 3. Enfin le code (filtré par .dockerignore)
COPY . .

# =====================================================================================
# client : le front
# =====================================================================================
FROM workspace AS client-build
# Installe le front et ce dont il dépend (« ... » : ses paquets du dépôt compris),
# depuis les fichiers déjà téléchargés (--offline), exactement selon le lockfile
RUN pnpm install --offline --frozen-lockfile --filter "@citadel/client..."
# APP_VERSION : le tag git (v2026.10.25), fourni par images.yml ; « local » sur ton PC.
# Déclarée ici, après l'installation : changer de version ne refait pas l'installation
ARG APP_VERSION=local
# version.json : permet de demander au site quelle version il sert (curl …/version.json)
RUN pnpm --filter @citadel/client build \
	&& printf '{"version":"%s"}\n' "$APP_VERSION" > apps/client/build/version.json

FROM ${NGINX_IMAGE} AS client
# La conf nginx est un modèle : au démarrage, l'image remplace ${INTERNET_GAME_DATA_BASE_…}
# par les variables du conteneur (identifiants IGDB, depuis .env.prod) et écrit le résultat
# dans /etc/nginx/conf.d/. Le filtre limite le remplacement à ces variables : les $uri…
# de nginx restent intacts.
ENV NGINX_ENVSUBST_FILTER=^INTERNET_GAME_DATA_BASE_
COPY apps/client/nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=client-build /repo/apps/client/build/ /usr/share/nginx/html/
ARG APP_VERSION=local
# Labels OCI : relient l'image au dépôt sur GHCR, et disent quelle version elle contient
LABEL org.opencontainers.image.source="https://github.com/Alexandre-RICHARD/citadel" \
	org.opencontainers.image.title="citadel-client" \
	org.opencontainers.image.version="${APP_VERSION}"
EXPOSE 8080

# =====================================================================================
# server : l'API
# =====================================================================================
FROM workspace AS server-build
RUN pnpm install --offline --frozen-lockfile --filter "@citadel/server..."
# esbuild produit build/build.server.cjs : un seul fichier qui embarque déjà toutes les
# dépendances (express, sequelize, mariadb…). L'image finale n'a donc besoin ni de pnpm,
# ni de node_modules.
RUN pnpm --filter @citadel/server build

FROM ${NODE_IMAGE} AS server
ENV NODE_ENV=production
WORKDIR /app
# Le bundle et sa « source map », qui donne les vrais noms de fichiers dans les erreurs
COPY --from=server-build /repo/apps/server/build/ ./build/
ARG APP_VERSION=local
# Lue par le serveur : /health dit quelle version tourne
ENV APP_VERSION=${APP_VERSION}
LABEL org.opencontainers.image.source="https://github.com/Alexandre-RICHARD/citadel" \
	org.opencontainers.image.title="citadel-server" \
	org.opencontainers.image.version="${APP_VERSION}"
# L'utilisateur « node » (fourni par l'image) au lieu de root : une faille dans le serveur
# ne donne pas les droits de root dans le conteneur
USER node
EXPOSE 3000
CMD ["node", "--enable-source-maps", "build/build.server.cjs"]

# =====================================================================================
# migrations : Flyway et les migrations SQL de cette version
# =====================================================================================
# Les migrations suivent la version du serveur : déployer v2026.10.25, c'est appliquer
# les migrations de v2026.10.25, contenues dans l'image du même tag.
FROM ${FLYWAY_IMAGE} AS migrations
WORKDIR /flyway/project
# Même disposition que dans le dépôt : flyway.toml trouve les migrations par son chemin relatif
COPY apps/server/flyway.toml ./
COPY apps/server/src/sql/migrations/ ./src/sql/migrations/
# FLYWAY_CONFIG_FILES : flyway.toml est lu sans avoir à le préciser à chaque commande.
# REDGATE_DISABLE_TELEMETRY : Flyway n'envoie pas de statistiques d'usage à son éditeur.
ENV FLYWAY_CONFIG_FILES=/flyway/project/flyway.toml \
	REDGATE_DISABLE_TELEMETRY=true
ARG APP_VERSION=local
LABEL org.opencontainers.image.source="https://github.com/Alexandre-RICHARD/citadel" \
	org.opencontainers.image.title="citadel-migrations" \
	org.opencontainers.image.version="${APP_VERSION}"
# « nobody » plutôt que root : Flyway n'écrit rien sur le disque
USER nobody
# Commande par défaut ; compose ou citadel demandent aussi « info » (migrations en attente)
CMD ["migrate"]

# =====================================================================================
# caddy : la porte d'entrée web (cahier des charges, §12.3)
# =====================================================================================
# L'image officielle de Caddy ne sait pas parler à Cloudflare : on recompile Caddy avec
# deux modules, grâce à xcaddy (fourni par l'image « builder ») :
#   - caddy-dns/cloudflare : obtenir les certificats par l'API DNS de Cloudflare ;
#   - caddy-cloudflare-ip  : connaître les adresses de Cloudflare, pour faire confiance à
#     l'IP du visiteur qu'il transmet (sans module de version publiée : figé par son commit).
FROM caddy:${CADDY_VERSION}-builder-alpine AS caddy-build
# XCADDY_SETCAP=0 : l'image builder demande à xcaddy de donner au binaire une « capacité
# de fichier » (droit d'écouter sur les ports < 1024). Avec cap_drop: ALL (compose.yml),
# le noyau refuserait alors de le lancer (« operation not permitted »). Elle est inutile :
# Docker autorise déjà ces ports dans un conteneur, sans droit particulier.
RUN XCADDY_SETCAP=0 xcaddy build \
	--output /tmp/caddy \
	--with github.com/caddy-dns/cloudflare@v0.2.4 \
	--with github.com/WeidiDeng/caddy-cloudflare-ip@f53b62aa13cb7ad79c8b47aacc3f2f03989b67e5

FROM caddy:${CADDY_VERSION}-alpine AS caddy
COPY --from=caddy-build /tmp/caddy /usr/bin/caddy
# Les règles de Caddy font partie de la version : une règle modifiée part en prod avec elle
COPY infra/Caddyfile /etc/caddy/Caddyfile
# Un utilisateur sans droits. Il peut quand même écouter sur 80 et 443 dans le conteneur :
# Docker l'autorise depuis sa version 20.10, sans capacité supplémentaire.
# /data (certificats) et /config lui appartiennent ; un volume Docker neuf reprend ces droits.
RUN addgroup -S -g 1000 caddy \
	&& adduser -S -D -H -u 1000 -G caddy caddy \
	&& mkdir -p /data/caddy /config/caddy \
	&& chown -R caddy:caddy /data /config
ARG APP_VERSION=local
LABEL org.opencontainers.image.source="https://github.com/Alexandre-RICHARD/citadel" \
	org.opencontainers.image.title="citadel-caddy" \
	org.opencontainers.image.version="${APP_VERSION}"
USER caddy

# =====================================================================================
# ops : les outils du NAS (cahier des charges, §8.2 et §10.2)
# =====================================================================================
# `citadel deploy <version>` lance un conteneur jetable de CETTE image, à la version
# demandée : il contient le compose.yml et la logique de déploiement de cette version.
# Le NAS n'a donc besoin que de Docker et du petit script /Volume1/citadel/citadel.
FROM ${ALPINE_IMAGE} AS ops
# bash, curl, jq : le script citadel ; docker-cli et son plugin compose : piloter Docker
# du NAS (par son socket) ; mariadb-client et zstd : dumps compressés de la base ;
# coreutils : sha256sum, et un `date` qui lit les dates de Docker ; util-linux-misc :
# flock, le verrou partagé ; tzdata : l'heure de Paris dans les noms de fichiers ;
# supercronic : le cron d'infra-ops, qui lit infra/ops/crontab.
# rclone et regctl arriveront avec les sauvegardes et les mises à jour (étapes 28, 29).
RUN apk add --no-cache \
	bash curl jq \
	docker-cli docker-cli-compose \
	mariadb-client zstd \
	coreutils util-linux-misc tzdata \
	supercronic
ENV TZ=Europe/Paris
WORKDIR /opt/citadel
COPY infra/compose.yml infra/mariadb-init.sh ./
# Le planning des jobs d'infra-ops
COPY infra/ops/ ./ops/
COPY --chmod=755 infra/citadel /usr/local/bin/citadel
ARG APP_VERSION=local
# CITADEL_IN_OPS : dit à citadel qu'il tourne dans ce conteneur (et pas sur le NAS),
# donc qu'il fait le travail lui-même. CITADEL_VERSION : la version de cette image,
# donc celle de son compose.yml.
ENV CITADEL_IN_OPS=1 \
	CITADEL_VERSION=${APP_VERSION}
LABEL org.opencontainers.image.source="https://github.com/Alexandre-RICHARD/citadel" \
	org.opencontainers.image.title="citadel-ops" \
	org.opencontainers.image.version="${APP_VERSION}"
# Pas d'utilisateur dédié : piloter Docker par son socket revient de toute façon à être
# root sur le NAS. Ce conteneur n'écoute sur aucun port et n'exécute que citadel.
ENTRYPOINT ["citadel"]
