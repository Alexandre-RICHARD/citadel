import type { CreateUserVersion } from "@citadel/specs/src/projects/backlog/endpoint/userVersions/createUserVersion/createUserVersionEndpoint.interface.ts";
import type { DeleteUserVersion } from "@citadel/specs/src/projects/backlog/endpoint/userVersions/deleteUserVersion/deleteUserVersionEndpoint.interface.ts";
import type { SetDlcDone } from "@citadel/specs/src/projects/backlog/endpoint/userVersions/setDlcDone/setDlcDoneEndpoint.interface.ts";
import type { UpdateUserVersion } from "@citadel/specs/src/projects/backlog/endpoint/userVersions/updateUserVersion/updateUserVersionEndpoint.interface.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";

import { protectedRequestHandler } from "../../../common/routing/protectedRequestHandler.ts";
import { fromUserGameBeanToUserGameDto } from "../mapper/dtoBean/userGame/fromUserGameBeanToUserGameDto.ts";
import { fromCreateUserVersionDtoToCreateUserVersionBean } from "../mapper/dtoBean/userVersion/fromCreateUserVersionDtoToCreateUserVersionBean.ts";
import { fromDeleteUserVersionDtoToDeleteUserVersionBean } from "../mapper/dtoBean/userVersion/fromDeleteUserVersionDtoToDeleteUserVersionBean.ts";
import { fromSetDlcDoneDtoToSetDlcDoneBean } from "../mapper/dtoBean/userVersion/fromSetDlcDoneDtoToSetDlcDoneBean.ts";
import { fromUpdateUserVersionDtoToUpdateUserVersionBean } from "../mapper/dtoBean/userVersion/fromUpdateUserVersionDtoToUpdateUserVersionBean.ts";
import { userVersionService } from "../service/userVersionService.ts";

export const userVersionController = {
	create: protectedRequestHandler<CreateUserVersion>(
		async (request, response, session) => {
			const userGame = await userVersionService.createUserVersion(
				session.userId,
				fromCreateUserVersionDtoToCreateUserVersionBean(
					request.params,
					request.body,
				),
			);

			return response
				.status(HttpStatutCodeSuccessEnum.CREATED)
				.json(fromUserGameBeanToUserGameDto(userGame));
		},
	),

	update: protectedRequestHandler<UpdateUserVersion>(
		async (request, response, session) => {
			const userGame = await userVersionService.updateUserVersion(
				session.userId,
				fromUpdateUserVersionDtoToUpdateUserVersionBean(
					request.params,
					request.body,
				),
			);

			return response
				.status(HttpStatutCodeSuccessEnum.SUCCESS)
				.json(fromUserGameBeanToUserGameDto(userGame));
		},
	),

	delete: protectedRequestHandler<DeleteUserVersion>(
		async (request, response, session) => {
			await userVersionService.deleteUserVersion(
				session.userId,
				fromDeleteUserVersionDtoToDeleteUserVersionBean(request.params),
			);

			return response.status(HttpStatutCodeSuccessEnum.NO_CONTENT).end();
		},
	),

	setDlcDone: protectedRequestHandler<SetDlcDone>(
		async (request, response, session) => {
			const userGame = await userVersionService.setDlcDone(
				session.userId,
				fromSetDlcDoneDtoToSetDlcDoneBean(request.params, request.body),
			);

			return response
				.status(HttpStatutCodeSuccessEnum.SUCCESS)
				.json(fromUserGameBeanToUserGameDto(userGame));
		},
	),
};
