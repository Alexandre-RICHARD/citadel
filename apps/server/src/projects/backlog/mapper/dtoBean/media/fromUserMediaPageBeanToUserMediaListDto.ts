import type { UserMediaListDto } from "@citadel/specs/src/projects/backlog/dto/userMedia/userMediaListDto.type.ts";

import type { UserMediaPageBean } from "../../../bean/userMediaPageBean.type.ts";
import { fromUserMediaBeanToUserMediaDto } from "./fromUserMediaBeanToUserMediaDto.ts";

export function fromUserMediaPageBeanToUserMediaListDto(
	page: UserMediaPageBean,
): UserMediaListDto {
	return {
		userMedia: page.userMedia.map(fromUserMediaBeanToUserMediaDto),
		matchedCount: page.matchedCount,
		movieCount: page.movieCount,
		showCount: page.showCount,
		originalLanguages: page.originalLanguages,
	};
}
