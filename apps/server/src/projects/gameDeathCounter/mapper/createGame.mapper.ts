import type { CreateGameBodyDto } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/games/createGame/createGameBody.dto.ts";

import type { CreateGameBean } from "../bean/createGameBean.ts";

export const createGameMapper = {
	fromCreateGameDtoToCreateGameBean: (
		createGameBodyDto: CreateGameBodyDto,
	): CreateGameBean => {
		const createGameBean = {
			name: createGameBodyDto.name,
		};
		return createGameBean;
	},
};
