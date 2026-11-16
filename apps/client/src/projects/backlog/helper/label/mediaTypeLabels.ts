import { MediaTypeEnum } from "@citadel/specs/src/projects/backlog/enum/mediaType.enum";

export const mediaTypeLabels: Readonly<Record<MediaTypeEnum, string>> = {
	[MediaTypeEnum.MOVIE]: "Film",
	[MediaTypeEnum.SHOW]: "Série",
};
