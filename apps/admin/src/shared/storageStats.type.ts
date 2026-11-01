import type { Unavailable } from "./unavailable.type.ts";

// La place prise par ce que l'infra fait tourner, relevée chaque heure par infra-ops
// (job storage-stats, state/storage.json). null : pas lue au dernier relevé.
export type StorageStats =
	| {
			available: true;
			checkedAt: string;
			docker: {
				imagesBytes: number;
				// Les couches propres des conteneurs (ce qu'ils ont écrit hors volumes)
				containersBytes: number;
				volumesBytes: number;
				buildCacheBytes: number;
				// Ce que le nettoyage libérerait (images inutiles, cache de build)
				reclaimableBytes: number;
			};
			// /Volume1/appdata : configs et données des services, bases MariaDB comprises
			appdataBytes: number | null;
			backupsBytes: number | null;
			// La base du site, vue par MariaDB : données et index des tables
			databaseBytes: number | null;
	  }
	| Unavailable;
