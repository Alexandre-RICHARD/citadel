import type { MediaTypeEnum } from "@citadel/specs/src/projects/backlog/enum/mediaType.enum.ts";

export type GetMediaPostersBean = {
	mediaType: MediaTypeEnum;
	tmdbId: number;
};
