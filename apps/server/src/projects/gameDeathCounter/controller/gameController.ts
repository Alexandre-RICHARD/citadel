import type { CreateGame } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/games/createGame/createGameEndpoint.interface.ts";
import type { DeleteGame } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/games/deleteGame/deleteGameEndpoint.interface.ts";
import type { GetAllGames } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/games/getAllGames/getAllGamesEndpoint.interface.ts";
import type { GetOneGame } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/games/getOneGame/getOneGameEndpoint.interface.ts";
import type { SetGameFinished } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/games/setGameFinished/setGameFinishedEndpoint.interface.ts";
import type { UpdateGame } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/games/updateGame/updateGameEndpoint.interface.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";

import { asyncRequestHandler } from "../../../common/routing/asyncRequestHandler.ts";
import { fromCreateGameDtoToCreateGameBean } from "../mapper/dtoBean/game/fromCreateGameDtoToCreateGameBean.ts";
import { fromDeleteGameDtoToDeleteGameBean } from "../mapper/dtoBean/game/fromDeleteGameDtoToDeleteGameBean.ts";
import { fromGameBeanToGameDto } from "../mapper/dtoBean/game/fromGameBeanToGameDto.ts";
import { fromGameSummaryBeanListToGameListDto } from "../mapper/dtoBean/game/fromGameSummaryBeanListToGameListDto.ts";
import { fromGameSummaryBeanToGameSummaryDto } from "../mapper/dtoBean/game/fromGameSummaryBeanToGameSummaryDto.ts";
import { fromGetOneGameDtoToGetOneGameBean } from "../mapper/dtoBean/game/fromGetOneGameDtoToGetOneGameBean.ts";
import { fromSetGameFinishedDtoToSetGameFinishedBean } from "../mapper/dtoBean/game/fromSetGameFinishedDtoToSetGameFinishedBean.ts";
import { fromUpdateGameDtoToUpdateGameBean } from "../mapper/dtoBean/game/fromUpdateGameDtoToUpdateGameBean.ts";
import { gameService } from "../service/gameService.ts";

export const gameController = {
	getAll: asyncRequestHandler<GetAllGames>(async (_request, response) => {
		const games = await gameService.getAllGames();

		if (games.length === 0)
			return response.status(HttpStatutCodeSuccessEnum.NO_CONTENT).end();

		return response
			.status(HttpStatutCodeSuccessEnum.SUCCESS)
			.json(fromGameSummaryBeanListToGameListDto(games));
	}),

	getOne: asyncRequestHandler<GetOneGame>(async (request, response) => {
		const getOneGameBean = fromGetOneGameDtoToGetOneGameBean(request.params);

		const game = await gameService.getOneGame(getOneGameBean);

		return response
			.status(HttpStatutCodeSuccessEnum.SUCCESS)
			.json(fromGameBeanToGameDto(game));
	}),

	create: asyncRequestHandler<CreateGame>(async (request, response) => {
		const createGameBean = fromCreateGameDtoToCreateGameBean(request.body);

		const game = await gameService.createGame(createGameBean);

		return response
			.status(HttpStatutCodeSuccessEnum.CREATED)
			.json(fromGameSummaryBeanToGameSummaryDto(game));
	}),

	update: asyncRequestHandler<UpdateGame>(async (request, response) => {
		const updateGameBean = fromUpdateGameDtoToUpdateGameBean(
			request.params,
			request.body,
		);

		const game = await gameService.updateGame(updateGameBean);

		return response
			.status(HttpStatutCodeSuccessEnum.SUCCESS)
			.json(fromGameSummaryBeanToGameSummaryDto(game));
	}),

	setFinished: asyncRequestHandler<SetGameFinished>(
		async (request, response) => {
			const setGameFinishedBean = fromSetGameFinishedDtoToSetGameFinishedBean(
				request.params,
				request.body,
			);

			const game = await gameService.setGameFinished(setGameFinishedBean);

			return response
				.status(HttpStatutCodeSuccessEnum.SUCCESS)
				.json(fromGameSummaryBeanToGameSummaryDto(game));
		},
	),

	delete: asyncRequestHandler<DeleteGame>(async (request, response) => {
		const deleteGameBean = fromDeleteGameDtoToDeleteGameBean(request.params);

		await gameService.deleteGame(deleteGameBean);

		return response.status(HttpStatutCodeSuccessEnum.NO_CONTENT).end();
	}),
};
