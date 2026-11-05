import type { CreateUserGame } from "@citadel/specs/src/projects/backlog/endpoint/userGames/createUserGame/createUserGameEndpoint.interface.ts";
import type { CustomizeUserGame } from "@citadel/specs/src/projects/backlog/endpoint/userGames/customizeUserGame/customizeUserGameEndpoint.interface.ts";
import type { DeleteUserGame } from "@citadel/specs/src/projects/backlog/endpoint/userGames/deleteUserGame/deleteUserGameEndpoint.interface.ts";
import type { GetUserGames } from "@citadel/specs/src/projects/backlog/endpoint/userGames/getUserGames/getUserGamesEndpoint.interface.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";

import { protectedRequestHandler } from "../../../common/routing/protectedRequestHandler.ts";
import { fromCreateUserGameDtoToCreateUserGameBean } from "../mapper/dtoBean/userGame/fromCreateUserGameDtoToCreateUserGameBean.ts";
import { fromCustomizeUserGameDtoToCustomizeUserGameBean } from "../mapper/dtoBean/userGame/fromCustomizeUserGameDtoToCustomizeUserGameBean.ts";
import { fromDeleteUserGameDtoToDeleteUserGameBean } from "../mapper/dtoBean/userGame/fromDeleteUserGameDtoToDeleteUserGameBean.ts";
import { fromGetUserGamesDtoToGetUserGamesBean } from "../mapper/dtoBean/userGame/fromGetUserGamesDtoToGetUserGamesBean.ts";
import { fromUserGameBeanToUserGameDto } from "../mapper/dtoBean/userGame/fromUserGameBeanToUserGameDto.ts";
import { fromUserGamePageBeanToUserGameListDto } from "../mapper/dtoBean/userGame/fromUserGamePageBeanToUserGameListDto.ts";
import { userGameService } from "../service/userGameService.ts";

export const userGameController = {
	getAll: protectedRequestHandler<GetUserGames>(
		async (request, response, session) => {
			const page = await userGameService.getUserGames(
				session.userId,
				fromGetUserGamesDtoToGetUserGamesBean(request.query),
			);

			if (page.userGames.length === 0)
				return response.status(HttpStatutCodeSuccessEnum.NO_CONTENT).end();

			return response
				.status(HttpStatutCodeSuccessEnum.SUCCESS)
				.json(fromUserGamePageBeanToUserGameListDto(page));
		},
	),

	create: protectedRequestHandler<CreateUserGame>(
		async (request, response, session) => {
			const userGame = await userGameService.createUserGame(
				session.userId,
				fromCreateUserGameDtoToCreateUserGameBean(request.body),
			);

			return response
				.status(HttpStatutCodeSuccessEnum.CREATED)
				.json(fromUserGameBeanToUserGameDto(userGame));
		},
	),

	customize: protectedRequestHandler<CustomizeUserGame>(
		async (request, response, session) => {
			const userGame = await userGameService.customizeUserGame(
				session.userId,
				fromCustomizeUserGameDtoToCustomizeUserGameBean(
					request.params,
					request.body,
				),
			);

			return response
				.status(HttpStatutCodeSuccessEnum.SUCCESS)
				.json(fromUserGameBeanToUserGameDto(userGame));
		},
	),

	delete: protectedRequestHandler<DeleteUserGame>(
		async (request, response, session) => {
			await userGameService.deleteUserGame(
				session.userId,
				fromDeleteUserGameDtoToDeleteUserGameBean(request.params),
			);

			return response.status(HttpStatutCodeSuccessEnum.NO_CONTENT).end();
		},
	),
};
