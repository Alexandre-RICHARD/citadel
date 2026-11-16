import type { GetShowSeasonsPathParamDto } from "@citadel/specs/src/projects/backlog/endpoint/userMedia/getShowSeasons/getShowSeasonsPathParamDto.type.ts";

import type { UserMediaIdBean } from "../../../bean/userMediaIdBean.type.ts";

export function fromGetShowSeasonsDtoToUserMediaIdBean(
	pathParamDto: GetShowSeasonsPathParamDto,
): UserMediaIdBean {
	return { userMediaId: pathParamDto.userMediaId };
}
