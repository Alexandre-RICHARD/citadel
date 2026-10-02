import type { CreateGameBodyDto } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/games/createGame/createGameBodyDto.type.ts";

import type { CreateGameBean } from "../../../bean/createGameBean.type.ts";

export function fromCreateGameDtoToCreateGameBean(
	createGameBodyDto: CreateGameBodyDto,
): CreateGameBean {
	const createGameBean = {
		name: createGameBodyDto.name,
	};
	return createGameBean;
}
