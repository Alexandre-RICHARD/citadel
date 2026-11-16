import { NasColumnEnum } from "@citadel/specs/src/projects/backlog/enum/nasColumn.enum";

// Libellé complet de chaque colonne du NAS (mode connecté)
export const nasColumnLabels: Readonly<Record<NasColumnEnum, string>> = {
	[NasColumnEnum.VERIFIED]: "Vérifié",
	[NasColumnEnum.STORAGE]: "Stockage",
	[NasColumnEnum.JELLYFIN_COLLECTION]: "Collection Jellyfin",
	[NasColumnEnum.SHARING]: "Partage",
	[NasColumnEnum.TORRENTS]: "Torrents",
	[NasColumnEnum.QUALITY]: "Qualité",
	[NasColumnEnum.LANGUAGES]: "Langues",
	[NasColumnEnum.SIZE]: "Taille",
	[NasColumnEnum.GB_PER_HOUR]: "Poids par heure",
	[NasColumnEnum.GAPS]: "Écarts",
};
