import type { GetMediaPostersPathParamDto } from "@citadel/specs/src/projects/backlog/endpoint/tmdb/getMediaPosters/getMediaPostersPathParamDto.type.ts";

import type { GetMediaPostersBean } from "../../../bean/getMediaPostersBean.type.ts";

export function fromGetMediaPostersDtoToGetMediaPostersBean(
	pathParamDto: GetMediaPostersPathParamDto,
): GetMediaPostersBean {
	return { mediaType: pathParamDto.mediaType, tmdbId: pathParamDto.tmdbId };
}
