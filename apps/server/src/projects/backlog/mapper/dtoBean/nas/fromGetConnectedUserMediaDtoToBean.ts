import type { GetConnectedUserMediaQueryParamDto } from "@citadel/specs/src/projects/backlog/endpoint/nas/getConnectedUserMedia/getConnectedUserMediaQueryParamDto.type.ts";
import { connectedMediaColumnFilterKinds } from "@citadel/specs/src/projects/backlog/helper/view/connectedMediaColumnFilterKinds.ts";
import { readViewParams } from "@citadel/specs/src/projects/backlog/helper/view/readViewParams.ts";

import type { GetConnectedUserMediaBean } from "../../../bean/getConnectedUserMediaBean.type.ts";
import { readQueryParam } from "../common/readQueryParam.ts";

// Le schéma a déjà vérifié chaque paramètre : ils se lisent tous
export function fromGetConnectedUserMediaDtoToBean(
	queryParamDto: GetConnectedUserMediaQueryParamDto,
): GetConnectedUserMediaBean {
	return {
		page: queryParamDto.page,
		...readViewParams(connectedMediaColumnFilterKinds, (name) =>
			readQueryParam(queryParamDto, name),
		),
	};
}
