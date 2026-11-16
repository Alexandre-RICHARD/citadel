import type { MediaTypeEnum } from "../../enum/mediaType.enum.ts";

// Un média du backlog dans sa saga
export type SagaEntryDto = {
	userMediaId: number;
	sagaNumber: number;
	mediaType: MediaTypeEnum;
	title: string;
	originalTitle: string;
	releaseDate: string | null;
};
