import type { MediaTypeEnum } from "@citadel/specs/src/projects/backlog/enum/mediaType.enum.ts";

import type { MediaCustomizationBean } from "./mediaCustomizationBean.type.ts";

export type CreateUserMediaBean = {
	mediaType: MediaTypeEnum;
	tmdbId: number;
	customization: MediaCustomizationBean;
};
