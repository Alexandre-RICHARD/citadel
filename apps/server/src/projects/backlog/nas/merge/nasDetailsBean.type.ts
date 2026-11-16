import type { LanguageTagEnum } from "@citadel/specs/src/projects/backlog/enum/languageTag.enum.ts";
import type { NasQualityEnum } from "@citadel/specs/src/projects/backlog/enum/nasQuality.enum.ts";
import type { NasSharingEnum } from "@citadel/specs/src/projects/backlog/enum/nasSharing.enum.ts";
import type { NasStorageEnum } from "@citadel/specs/src/projects/backlog/enum/nasStorage.enum.ts";
import type { NasGap } from "@citadel/specs/src/projects/backlog/mediaState/nasGap.type.ts";

// Les colonnes du NAS d'une ligne (film, série, saison, épisode) ; voir NasDetailsDto
export type NasDetailsBean = {
	storage: NasStorageEnum;
	episodeCount: number | null;
	fileCount: number;
	jellyfinItemId: string | null;
	jellyfinCollection: string | null;
	sharing: NasSharingEnum;
	torrents: {
		name: string;
		trackerName: string | null;
		sharing: NasSharingEnum;
	}[];
	quality: NasQualityEnum | null;
	languageTags: { tag: LanguageTagEnum; count: number }[];
	sizeBytes: number | null;
	gbPerHour: number | null;
	fileMinutes: number | null;
	isRuntimeMismatch: boolean;
	gaps: NasGap[];
	verifiedCount: number;
	verifiableCount: number;
};
