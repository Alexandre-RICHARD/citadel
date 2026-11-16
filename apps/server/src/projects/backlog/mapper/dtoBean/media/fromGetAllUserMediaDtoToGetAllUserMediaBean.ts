import type { GetAllUserMediaQueryParamDto } from "@citadel/specs/src/projects/backlog/endpoint/userMedia/getAllUserMedia/getAllUserMediaQueryParamDto.type.ts";
import { mediaColumnFilterKinds } from "@citadel/specs/src/projects/backlog/helper/view/mediaColumnFilterKinds.ts";
import { readViewParams } from "@citadel/specs/src/projects/backlog/helper/view/readViewParams.ts";

import type { GetAllUserMediaBean } from "../../../bean/getAllUserMediaBean.type.ts";
import { readQueryParam } from "../common/readQueryParam.ts";

// Le schéma a déjà vérifié chaque paramètre : ils se lisent tous
export function fromGetAllUserMediaDtoToGetAllUserMediaBean(
	queryParamDto: GetAllUserMediaQueryParamDto,
): GetAllUserMediaBean {
	return {
		page: queryParamDto.page,
		...readViewParams(mediaColumnFilterKinds, (name) =>
			readQueryParam(queryParamDto, name),
		),
	};
}
