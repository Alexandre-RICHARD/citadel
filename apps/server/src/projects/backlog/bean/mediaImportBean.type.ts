import type { MediaImportStatusEnum } from "@citadel/specs/src/projects/backlog/enum/mediaImportStatus.enum.ts";

import type { MediaImportRecognizedBean } from "./mediaImportRecognizedBean.type.ts";
import type { MediaImportRejectedBean } from "./mediaImportRejectedBean.type.ts";

// L'import en cours d'un compte, tel que l'aperçu l'affiche
export type MediaImportBean = {
	status: MediaImportStatusEnum;
	readCount: number;
	totalCount: number;
	recognized: MediaImportRecognizedBean[];
	rejected: MediaImportRejectedBean[];
};
