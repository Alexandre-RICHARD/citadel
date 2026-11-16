import type { MediaImportRejectionEnum } from "../../enum/mediaImportRejection.enum.ts";
import type { MediaTypeEnum } from "../../enum/mediaType.enum.ts";

// Une ligne de la liste qui ne sera pas reprise, avec la raison
export type MediaImportRejectedDto = {
	mediaType: MediaTypeEnum;
	tmdbId: number;
	reason: MediaImportRejectionEnum;
};
