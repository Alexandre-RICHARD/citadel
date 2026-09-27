import type { CreateGame } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/games/createGame/createGame.endpoint.ts";
import { type DeleteGame } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/games/deleteGame/deleteGame.endpoint.ts";
import type { GetAllGames } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/games/getAllGames/getAllGames.endpoint.ts";
import type { GetOneGame } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/games/getOneGame/getOneGame.endpoint.ts";
import type { SetGameFinished } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/games/setGameFinished/setGameFinished.endpoint.ts";
import { HttpStatutCodeErrorEnum } from "@citadel/specs/src/specUtils/httpStatutCodeError.enum.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";

import { asyncRequestHandler } from "../../../common/routing/asyncRequestHandler.ts";
import { DatabaseError } from "../../../error/DatabaseError.ts";
import { handleBaseError } from "../../../error/handleBaseError.ts";
import { NotFoundError } from "../../../error/NotFoundError.ts";
import { fromCreateGameDtoToCreateGameBean } from "../mapper/dtoBean/game/fromCreateGameDtoToCreateGameBean.ts";
import { fromDeleteGameDtoToDeleteGameBean } from "../mapper/dtoBean/game/fromDeleteGameDtoToDeleteGameBean.ts";
import { fromGameBeanToGameDto } from "../mapper/dtoBean/game/fromGameBeanToGameDto.ts";
import { fromGameSummaryBeanListToGameListDto } from "../mapper/dtoBean/game/fromGameSummaryBeanListToGameListDto.ts";
import { fromGameSummaryBeanToGameSummaryDto } from "../mapper/dtoBean/game/fromGameSummaryBeanToGameSummaryDto.ts";
import { fromGetOneGameDtoToGetOneGameBean } from "../mapper/dtoBean/game/fromGetOneGameDtoToGetOneGameBean.ts";
import { fromSetGameFinishedDtoToSetGameFinishedBean } from "../mapper/dtoBean/game/fromSetGameFinishedDtoToSetGameFinishedBean.ts";
import { gameService } from "../service/game.service.ts";

export const gameController = {
	getAll: asyncRequestHandler<GetAllGames>(async (_request, response) => {
		try {
			const games = await gameService.getAllGames();

			return response
				.status(HttpStatutCodeSuccessEnum.SUCCESS)
				.json(fromGameSummaryBeanListToGameListDto(games));
		} catch (error) {
			void handleBaseError(error);
			switch (true) {
				case error instanceof DatabaseError:
				default:
					return response
						.status(HttpStatutCodeErrorEnum.SERVER_ERROR)
						.json(null);
			}
		}
	}),

	getOne: asyncRequestHandler<GetOneGame>(async (request, response) => {
		const { params } = request;

		try {
			const getOneGameBean = fromGetOneGameDtoToGetOneGameBean(params);

			const game = await gameService.getOneGame(getOneGameBean);

			return response
				.status(HttpStatutCodeSuccessEnum.SUCCESS)
				.json(fromGameBeanToGameDto(game));
		} catch (error) {
			void handleBaseError(error);
			switch (true) {
				case error instanceof NotFoundError:
					return response.status(HttpStatutCodeErrorEnum.NOT_FOUND).json(null);

				case error instanceof DatabaseError:
				default:
					return response
						.status(HttpStatutCodeErrorEnum.SERVER_ERROR)
						.json(null);
			}
		}
	}),

	create: asyncRequestHandler<CreateGame>(async (request, response) => {
		const { body } = request;

		try {
			const createGameBean = fromCreateGameDtoToCreateGameBean(body);

			const game = await gameService.createGame(createGameBean);

			return response
				.status(HttpStatutCodeSuccessEnum.CREATED)
				.json(fromGameSummaryBeanToGameSummaryDto(game));
		} catch (error) {
			void handleBaseError(error);
			switch (true) {
				case error instanceof NotFoundError:
				default:
					return response
						.status(HttpStatutCodeErrorEnum.SERVER_ERROR)
						.json(null);
			}
		}
	}),

	setFinished: asyncRequestHandler<SetGameFinished>(
		async (request, response) => {
			const { params, body } = request;

			try {
				const setGameFinishedBean = fromSetGameFinishedDtoToSetGameFinishedBean(
					params,
					body,
				);

				const game = await gameService.setGameFinished(setGameFinishedBean);

				return response
					.status(HttpStatutCodeSuccessEnum.SUCCESS)
					.json(fromGameSummaryBeanToGameSummaryDto(game));
			} catch (error) {
				void handleBaseError(error);
				switch (true) {
					case error instanceof NotFoundError:
						return response
							.status(HttpStatutCodeErrorEnum.NOT_FOUND)
							.json(null);
					case error instanceof DatabaseError:
					default:
						return response
							.status(HttpStatutCodeErrorEnum.SERVER_ERROR)
							.json(null);
				}
			}
		},
	),

	delete: asyncRequestHandler<DeleteGame>(async (request, response) => {
		const { params } = request;

		try {
			const deleteGameBean = fromDeleteGameDtoToDeleteGameBean(params);

			await gameService.deleteGame(deleteGameBean);

			return response.status(HttpStatutCodeSuccessEnum.SUCCESS).json(null);
		} catch (error) {
			void handleBaseError(error);
			switch (true) {
				case error instanceof NotFoundError:
					return response.status(HttpStatutCodeErrorEnum.NOT_FOUND).json(null);

				case error instanceof DatabaseError:
				default:
					return response
						.status(HttpStatutCodeErrorEnum.SERVER_ERROR)
						.json(null);
			}
		}
	}),
};
