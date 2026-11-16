import type { MediaImportRejectionEnum } from "@citadel/specs/src/projects/backlog/enum/mediaImportRejection.enum.ts";
import type { MediaTypeEnum } from "@citadel/specs/src/projects/backlog/enum/mediaType.enum.ts";

export type MediaImportRejectedBean = {
	mediaType: MediaTypeEnum;
	tmdbId: number;
	reason: MediaImportRejectionEnum;
};
