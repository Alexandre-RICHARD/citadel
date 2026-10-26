import type { GetGamePreviewPathParamDto } from "@citadel/specs/src/projects/backlog/endpoint/igdb/getGamePreview/getGamePreviewPathParamDto.type.ts";

import type { GetGamePreviewBean } from "../../../bean/getGamePreviewBean.type.ts";

export function fromGetGamePreviewDtoToGetGamePreviewBean(
	pathParamDto: GetGamePreviewPathParamDto,
): GetGamePreviewBean {
	return { igdbId: pathParamDto.igdbId };
}
