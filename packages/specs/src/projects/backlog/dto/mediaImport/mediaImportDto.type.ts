import type { MediaImportStatusEnum } from "../../enum/mediaImportStatus.enum.ts";
import type { MediaImportRecognizedDto } from "./mediaImportRecognizedDto.type.ts";
import type { MediaImportRejectedDto } from "./mediaImportRejectedDto.type.ts";

/**
 * L'import en cours du compte. Pendant la lecture, seule la progression compte : les listes restent vides jusqu'à
 * READY, pour que l'interrogation répétée reste légère même pour plusieurs milliers de films
 */
export type MediaImportDto = {
	status: MediaImportStatusEnum;
	readCount: number;
	totalCount: number;
	recognized: MediaImportRecognizedDto[];
	rejected: MediaImportRejectedDto[];
};
