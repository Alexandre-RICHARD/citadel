import type { ShowUpdateListDto } from "@citadel/specs/src/projects/backlog/dto/showUpdate/showUpdateListDto.type.ts";

import type { ShowUpdateBean } from "../../../bean/showUpdateBean.type.ts";

export function fromShowUpdateBeanListToShowUpdateListDto(
	updates: ShowUpdateBean[],
): ShowUpdateListDto {
	return updates.map(({ tmdbId, title, newSeasonCount, newEpisodeCount }) => ({
		tmdbId,
		title,
		newSeasonCount,
		newEpisodeCount,
	}));
}
