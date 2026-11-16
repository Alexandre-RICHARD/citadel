import type { MediaTypeEnum } from "@citadel/specs/src/projects/backlog/enum/mediaType.enum";

// Un média du backlog dans sa saga, désigné par sa ligne
export type SagaEntryFm = {
	userMediaId: number;
	sagaNumber: number;
	mediaType: MediaTypeEnum;
	title: string;
	originalTitle: string | null;
	releaseDate: string | null;
};
