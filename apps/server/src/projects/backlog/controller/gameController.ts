import type { GetStoredGame } from "@citadel/specs/src/projects/backlog/endpoint/games/getStoredGame/getStoredGameEndpoint.interface.ts";
import type { GetStoredGames } from "@citadel/specs/src/projects/backlog/endpoint/games/getStoredGames/getStoredGamesEndpoint.interface.ts";
import type { ImportGameContent } from "@citadel/specs/src/projects/backlog/endpoint/games/importGameContent/importGameContentEndpoint.interface.ts";
import type { StoreGame } from "@citadel/specs/src/projects/backlog/endpoint/games/storeGame/storeGameEndpoint.interface.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";

import { asyncRequestHandler } from "../../../common/routing/asyncRequestHandler.ts";
import { fromGetStoredGameDtoToGetStoredGameBean } from "../mapper/dtoBean/game/fromGetStoredGameDtoToGetStoredGameBean.ts";
import { fromGetStoredGamesDtoToGetStoredGamesBean } from "../mapper/dtoBean/game/fromGetStoredGamesDtoToGetStoredGamesBean.ts";
import { fromImportGameContentDtoToImportGameContentBean } from "../mapper/dtoBean/game/fromImportGameContentDtoToImportGameContentBean.ts";
import { fromStoredGameBeanToStoredGameDto } from "../mapper/dtoBean/game/fromStoredGameBeanToStoredGameDto.ts";
import { fromStoredGamePageBeanToStoredGameListDto } from "../mapper/dtoBean/game/fromStoredGamePageBeanToStoredGameListDto.ts";
import { fromStoreGameDtoToStoreGameBean } from "../mapper/dtoBean/game/fromStoreGameDtoToStoreGameBean.ts";
import { gameService } from "../service/gameService.ts";

export const gameController = {
	getAll: asyncRequestHandler<GetStoredGames>(async (request, response) => {
		const page = await gameService.getStoredGames(
			fromGetStoredGamesDtoToGetStoredGamesBean(request.query),
		);

		if (page.games.length === 0)
			return response.status(HttpStatutCodeSuccessEnum.NO_CONTENT).end();

		return response
			.status(HttpStatutCodeSuccessEnum.SUCCESS)
			.json(fromStoredGamePageBeanToStoredGameListDto(page));
	}),

	getOne: asyncRequestHandler<GetStoredGame>(async (request, response) => {
		const game = await gameService.getStoredGame(
			fromGetStoredGameDtoToGetStoredGameBean(request.params),
		);

		return response
			.status(HttpStatutCodeSuccessEnum.SUCCESS)
			.json(fromStoredGameBeanToStoredGameDto(game));
	}),

	store: asyncRequestHandler<StoreGame>(async (request, response) => {
		const game = await gameService.storeGame(
			fromStoreGameDtoToStoreGameBean(request.body),
		);

		return response
			.status(HttpStatutCodeSuccessEnum.CREATED)
			.json(fromStoredGameBeanToStoredGameDto(game));
	}),

	importContent: asyncRequestHandler<ImportGameContent>(
		async (request, response) => {
			const game = await gameService.importGameContent(
				fromImportGameContentDtoToImportGameContentBean(
					request.params,
					request.body,
				),
			);

			return response
				.status(HttpStatutCodeSuccessEnum.SUCCESS)
				.json(fromStoredGameBeanToStoredGameDto(game));
		},
	),
};
