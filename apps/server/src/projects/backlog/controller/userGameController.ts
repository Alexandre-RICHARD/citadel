import type { CreateUserGame } from "@citadel/specs/src/projects/backlog/endpoint/userGames/createUserGame/createUserGameEndpoint.interface.ts";
import type { CustomizeUserGame } from "@citadel/specs/src/projects/backlog/endpoint/userGames/customizeUserGame/customizeUserGameEndpoint.interface.ts";
import type { DeleteUserGame } from "@citadel/specs/src/projects/backlog/endpoint/userGames/deleteUserGame/deleteUserGameEndpoint.interface.ts";
import type { GetUserGames } from "@citadel/specs/src/projects/backlog/endpoint/userGames/getUserGames/getUserGamesEndpoint.interface.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";

import { asyncRequestHandler } from "../../../common/routing/asyncRequestHandler.ts";
import { fromCreateUserGameDtoToCreateUserGameBean } from "../mapper/dtoBean/userGame/fromCreateUserGameDtoToCreateUserGameBean.ts";
import { fromCustomizeUserGameDtoToCustomizeUserGameBean } from "../mapper/dtoBean/userGame/fromCustomizeUserGameDtoToCustomizeUserGameBean.ts";
import { fromDeleteUserGameDtoToDeleteUserGameBean } from "../mapper/dtoBean/userGame/fromDeleteUserGameDtoToDeleteUserGameBean.ts";
import { fromGetUserGamesDtoToGetUserGamesBean } from "../mapper/dtoBean/userGame/fromGetUserGamesDtoToGetUserGamesBean.ts";
import { fromUserGameBeanToUserGameDto } from "../mapper/dtoBean/userGame/fromUserGameBeanToUserGameDto.ts";
import { fromUserGamePageBeanToUserGameListDto } from "../mapper/dtoBean/userGame/fromUserGamePageBeanToUserGameListDto.ts";
import { userGameService } from "../service/userGameService.ts";

export const userGameController = {
	getAll: asyncRequestHandler<GetUserGames>(async (request, response) => {
		const page = await userGameService.getUserGames(
			fromGetUserGamesDtoToGetUserGamesBean(request.query),
		);

		if (page.userGames.length === 0)
			return response.status(HttpStatutCodeSuccessEnum.NO_CONTENT).end();

		return response
			.status(HttpStatutCodeSuccessEnum.SUCCESS)
			.json(fromUserGamePageBeanToUserGameListDto(page));
	}),

	create: asyncRequestHandler<CreateUserGame>(async (request, response) => {
		const userGame = await userGameService.createUserGame(
			fromCreateUserGameDtoToCreateUserGameBean(request.body),
		);

		return response
			.status(HttpStatutCodeSuccessEnum.CREATED)
			.json(fromUserGameBeanToUserGameDto(userGame));
	}),

	customize: asyncRequestHandler<CustomizeUserGame>(
		async (request, response) => {
			const userGame = await userGameService.customizeUserGame(
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

	delete: asyncRequestHandler<DeleteUserGame>(async (request, response) => {
		await userGameService.deleteUserGame(
			fromDeleteUserGameDtoToDeleteUserGameBean(request.params),
		);

		return response.status(HttpStatutCodeSuccessEnum.NO_CONTENT).end();
	}),
};
