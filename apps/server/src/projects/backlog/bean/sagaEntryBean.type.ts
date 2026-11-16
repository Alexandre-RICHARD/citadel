import type { MediaTypeEnum } from "@citadel/specs/src/projects/backlog/enum/mediaType.enum.ts";

// Un média du backlog dans sa saga, désigné par sa ligne
export type SagaEntryBean = {
	userMediaId: number;
	sagaNumber: number;
	mediaType: MediaTypeEnum;
	title: string;
	originalTitle: string;
	releaseDate: string | null;
};
