import type { StoreGameBodyDto } from "@citadel/specs/src/projects/backlog/endpoint/games/storeGame/storeGameBodyDto.type.ts";

import type { StoreGameBean } from "../../../bean/storeGameBean.type.ts";

export function fromStoreGameDtoToStoreGameBean(
	bodyDto: StoreGameBodyDto,
): StoreGameBean {
	return {
		igdbId: bodyDto.igdbId,
		versionIds: bodyDto.versionIds,
		dlcIds: bodyDto.dlcIds,
	};
}
