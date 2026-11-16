import type { SearchTmdbMediaQueryParamDto } from "@citadel/specs/src/projects/backlog/endpoint/tmdb/searchTmdbMedia/searchTmdbMediaQueryParamDto.type.ts";

import type { SearchTmdbMediaBean } from "../../../bean/searchTmdbMediaBean.type.ts";

export function fromSearchTmdbMediaDtoToSearchTmdbMediaBean(
	queryParamDto: SearchTmdbMediaQueryParamDto,
): SearchTmdbMediaBean {
	return { query: queryParamDto.query };
}
