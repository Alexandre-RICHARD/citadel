import type { MediaImportRejectionEnum } from "@citadel/specs/src/projects/backlog/enum/mediaImportRejection.enum";
import type { MediaImportStatusEnum } from "@citadel/specs/src/projects/backlog/enum/mediaImportStatus.enum";
import type { MediaTypeEnum } from "@citadel/specs/src/projects/backlog/enum/mediaType.enum";

// L'import en cours : sa progression pendant la lecture, puis son aperçu (les listes restent vides jusque-là)
export type MediaImportFm = {
	status: MediaImportStatusEnum;
	readCount: number;
	totalCount: number;
	recognized: {
		mediaType: MediaTypeEnum;
		tmdbId: number;
		title: string;
		releaseYear: number | null;
		posterPath: string | null;
	}[];
	rejected: {
		mediaType: MediaTypeEnum;
		tmdbId: number;
		reason: MediaImportRejectionEnum;
	}[];
};
