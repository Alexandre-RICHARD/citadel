import type { SetEpisodesWatchedBodyDto } from "@citadel/specs/src/projects/backlog/endpoint/userMedia/setEpisodesWatched/setEpisodesWatchedBodyDto.type.ts";
import type { SetEpisodesWatchedPathParamDto } from "@citadel/specs/src/projects/backlog/endpoint/userMedia/setEpisodesWatched/setEpisodesWatchedPathParamDto.type.ts";

import type { SetEpisodesWatchedBean } from "../../../bean/setEpisodesWatchedBean.type.ts";

export function fromSetEpisodesWatchedDtoToSetEpisodesWatchedBean(
	pathParamDto: SetEpisodesWatchedPathParamDto,
	bodyDto: SetEpisodesWatchedBodyDto,
): SetEpisodesWatchedBean {
	return {
		userMediaId: pathParamDto.userMediaId,
		episodeIds: bodyDto.episodeIds,
		isWatched: bodyDto.isWatched,
	};
}
