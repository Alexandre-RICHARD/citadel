#!/usr/bin/env bash
# Scripts d'essai du backlog des médias (docs/backlog/backlog_media.md §9) : vérifient, avant toute interface,
# ce que TMDB, Radarr, Sonarr, Jellyfin et qBittorrent donnent vraiment, et produisent un rapport Excel.
# Temporaires : à supprimer, avec scripts/mediaTrial/ et la dépendance exceljs, quand le job media-sync existe.
#
# Usage : pnpm tools mediaTrial --short <liste.txt> [--list <export.xlsx> --files <fichiers.tsv>] [--nas <hôte>] [--out <rapport.xlsx>]
#   --short   la liste courte d'identifiants TMDB (modèle : scripts/mediaTrial/shortList.example.txt)
#   --list    « NAS Multimédia » exporté de Google Sheets (Fichier > Télécharger > Microsoft Excel)
#   --files   la liste des fichiers du NAS, voir plus bas
#   --nas     l'adresse du NAS (défaut : NAS_HOSTNAME du .env)
#   --out     le rapport (défaut : Téléchargements/media-trial-<date>.xlsx) ; refusé dans le dépôt, car il
#             contient des noms de torrents et de trackers
#
# Ce qu'il lit dans le .env : TMDB_API_KEY, et pour --list avec --files : RADARR_API_KEY, SONARR_API_KEY,
# JELLYFIN_API_KEY, QBITTORRENT_USER, QBITTORRENT_PASSWORD (voir .env.example).
# Radarr et Sonarr démarrent à la demande : les démarrer depuis la console avant de lancer --files.
#
# Rien n'est écrit nulle part, sauf le rapport : aucune étiquette ni aucun tracker n'est posé dans qBittorrent,
# rien n'est modifié dans Radarr, Sonarr ou Jellyfin.
#
# La liste des fichiers : une seule commande find sur le NAS, en lecture seule, qui écrit directement sur le PC
# (rien n'est laissé sur le NAS). Une ligne par fichier : inode, taille, nombre de liens physiques et chemin, séparés
# par des tabulations. L'inode relie un fichier de medias/ à son double dans torrents/ (même fichier, deux noms) :
#   ssh nas "find /Volume2/data -type f -printf '%i\t%s\t%n\t%p\n'" > <dossier>/media-files.tsv   (un dossier qui existe, hors du dépôt)
# (« nas » : l'alias ssh du NAS ; quelques secondes pour quelques dizaines de milliers de fichiers)

set -euo pipefail

# Le script vit dans scripts/mediaTrial/ ; node se lance depuis la racine du dépôt, où sont installés exceljs et le .env
cd "$(dirname "$0")/.."
node scripts/mediaTrial/mediaTrial.mjs "$@"
