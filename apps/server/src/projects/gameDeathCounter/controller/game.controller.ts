import type { CreateGame } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/games/createGame/createGame.endpoint.ts";
import { type DeleteGame } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/games/deleteGame/deleteGame.endpoint.ts";
import { HttpStatutCodeErrorEnum } from "@citadel/specs/src/specUtils/httpStatutCodeError.enum.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";

import { asyncRequestHandler } from "../../../common/routing/asyncRequestHandler.ts";
import { DatabaseError } from "../../../error/DatabaseError.ts";
import { NotFoundError } from "../../../error/NotFoundError.ts";
import { createGameMapper } from "../mapper/createGame.mapper.ts";
import { deleteGameMapper } from "../mapper/deleteGame.mapper.ts";
import { gameMapper } from "../mapper/game.mapper.ts";
import { gameService } from "../service/game.service.ts";

export const gameController = {
	create: asyncRequestHandler<CreateGame>(async (request, response) => {
		const { body } = request;

		try {
			const createGameBean =
				createGameMapper.fromCreateGameDtoToCreateGameBean(body);

			const game = await gameService.createGame(createGameBean);

			return response
				.status(HttpStatutCodeSuccessEnum.CREATED)
				.json(gameMapper.fromGameSummaryBeanToGameSummaryDto(game));
		} catch (error) {
			switch (true) {
				case error instanceof NotFoundError:
				default:
					return response
						.status(HttpStatutCodeErrorEnum.SERVER_ERROR)
						.json(null);
			}
		}
	}),

	delete: asyncRequestHandler<DeleteGame>(async (request, response) => {
		const { params } = request;

		try {
			const deleteGameBean =
				deleteGameMapper.fromDeleteGameDtoToDeleteGameBean(params);

			await gameService.deleteGame(deleteGameBean);

			return response.status(HttpStatutCodeSuccessEnum.SUCCESS).json(null);
		} catch (error) {
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
