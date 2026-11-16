import type { ShowSeasonListDto } from "@citadel/specs/src/projects/backlog/dto/userMedia/showSeasonListDto.type.ts";

import type { ShowSeasonBean } from "../../../bean/showSeasonBean.type.ts";

export function fromShowSeasonBeanListToShowSeasonListDto(
	seasons: ShowSeasonBean[],
): ShowSeasonListDto {
	return {
		seasons: seasons.map((season) => ({
			id: season.id,
			seasonNumber: season.seasonNumber,
			name: season.name,
			airDate: season.airDate,
			posterPath: season.posterPath,
			episodes: season.episodes.map((episode) => ({ ...episode })),
		})),
	};
}
