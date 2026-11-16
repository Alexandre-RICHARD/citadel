import type { UserMediaListDto } from "@citadel/specs/src/projects/backlog/dto/userMedia/userMediaListDto.type";
import { MediaTypeEnum } from "@citadel/specs/src/projects/backlog/enum/mediaType.enum";

// Le résumé d'une page quand un film ou une série entre (+1) ou sort (-1) du backlog
export function shiftMediaListCounts(
	page: UserMediaListDto,
	mediaType: MediaTypeEnum,
	delta: 1 | -1,
): Pick<UserMediaListDto, "matchedCount" | "movieCount" | "showCount"> {
	return {
		matchedCount: page.matchedCount + delta,
		movieCount:
			page.movieCount + (mediaType === MediaTypeEnum.MOVIE ? delta : 0),
		showCount: page.showCount + (mediaType === MediaTypeEnum.SHOW ? delta : 0),
	};
}
