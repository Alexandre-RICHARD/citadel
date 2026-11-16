import type { ConnectedShowSeasonListDto } from "@citadel/specs/src/projects/backlog/dto/nas/connectedShowSeasonListDto.type.ts";

import type { ConnectedShowSeasonBean } from "../../../bean/connectedShowSeasonBean.type.ts";
import { fromNasDetailsBeanToNasDetailsDto } from "./fromNasDetailsBeanToNasDetailsDto.ts";

export function fromConnectedShowSeasonBeanListToDto(
	seasons: ConnectedShowSeasonBean[],
): ConnectedShowSeasonListDto {
	return {
		seasons: seasons.map((season) => ({
			id: season.id,
			seasonNumber: season.seasonNumber,
			name: season.name,
			airDate: season.airDate,
			posterPath: season.posterPath,
			nas:
				season.nas === null
					? null
					: fromNasDetailsBeanToNasDetailsDto(season.nas),
			episodes: season.episodes.map(({ nas, ...episode }) => ({
				...episode,
				nas: nas === null ? null : fromNasDetailsBeanToNasDetailsDto(nas),
			})),
		})),
	};
}
