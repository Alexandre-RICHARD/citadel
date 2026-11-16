import type { NasQualityEnum } from "../../enum/nasQuality.enum.ts";
import type { NasSharingEnum } from "../../enum/nasSharing.enum.ts";
import type { NasStorageEnum } from "../../enum/nasStorage.enum.ts";
import type { NasGap } from "../../mediaState/nasGap.type.ts";
import type { LanguageTagCountDto } from "./languageTagCountDto.type.ts";
import type { NasTorrentDto } from "./nasTorrentDto.type.ts";

/**
 * Les colonnes du NAS d'une ligne (film, série, saison ou épisode), fusionnées depuis le dernier relevé. Une série et une
 * saison s'agrègent sur leurs épisodes principaux déjà diffusés (§4) : stockage et qualité les moins bons, partage le
 * meilleur, tailles additionnées, étiquettes et vérifiés comptés (`fileCount` fichiers en tout).
 * `episodeCount` : ces épisodes, null pour un film ou un épisode.
 * `verifiableCount` : les fichiers qu'on peut cocher « Vérifié » (un seul fichier : pas de doublon).
 * `isRuntimeMismatch` : la durée du fichier s'écarte de celle de TMDB, et le fichier n'est pas vérifié
 */
export type NasDetailsDto = {
	storage: NasStorageEnum;
	episodeCount: number | null;
	fileCount: number;
	jellyfinItemId: string | null;
	jellyfinCollection: string | null;
	sharing: NasSharingEnum;
	torrents: NasTorrentDto[];
	quality: NasQualityEnum | null;
	languageTags: LanguageTagCountDto[];
	sizeBytes: number | null;
	gbPerHour: number | null;
	fileMinutes: number | null;
	isRuntimeMismatch: boolean;
	gaps: NasGap[];
	verifiedCount: number;
	verifiableCount: number;
};
