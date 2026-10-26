import type { GetGameImagesPathParamDto } from "@citadel/specs/src/projects/backlog/endpoint/igdb/getGameImages/getGameImagesPathParamDto.type.ts";

import type { GetGameImagesBean } from "../../../bean/getGameImagesBean.type.ts";

export function fromGetGameImagesDtoToGetGameImagesBean(
	pathParamDto: GetGameImagesPathParamDto,
): GetGameImagesBean {
	return { igdbId: pathParamDto.igdbId };
}
