import type { ImportGameContentBodyDto } from "@citadel/specs/src/projects/backlog/endpoint/games/importGameContent/importGameContentBodyDto.type.ts";
import type { ImportGameContentPathParamDto } from "@citadel/specs/src/projects/backlog/endpoint/games/importGameContent/importGameContentPathParamDto.type.ts";

import type { ImportGameContentBean } from "../../../bean/importGameContentBean.type.ts";

export function fromImportGameContentDtoToImportGameContentBean(
	pathParamDto: ImportGameContentPathParamDto,
	bodyDto: ImportGameContentBodyDto,
): ImportGameContentBean {
	return {
		gameId: pathParamDto.gameId,
		versionIds: bodyDto.versionIds,
		dlcIds: bodyDto.dlcIds,
	};
}
