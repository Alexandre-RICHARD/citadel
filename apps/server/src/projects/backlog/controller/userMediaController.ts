import type { CreateUserMedia } from "@citadel/specs/src/projects/backlog/endpoint/userMedia/createUserMedia/createUserMediaEndpoint.interface.ts";
import type { CustomizeUserMedia } from "@citadel/specs/src/projects/backlog/endpoint/userMedia/customizeUserMedia/customizeUserMediaEndpoint.interface.ts";
import type { DeleteUserMedia } from "@citadel/specs/src/projects/backlog/endpoint/userMedia/deleteUserMedia/deleteUserMediaEndpoint.interface.ts";
import type { SetEpisodesWatched } from "@citadel/specs/src/projects/backlog/endpoint/userMedia/setEpisodesWatched/setEpisodesWatchedEndpoint.interface.ts";
import type { UpdateUserMedia } from "@citadel/specs/src/projects/backlog/endpoint/userMedia/updateUserMedia/updateUserMediaEndpoint.interface.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";

import { protectedRequestHandler } from "../../../common/routing/protectedRequestHandler.ts";
import { fromCreateUserMediaDtoToCreateUserMediaBean } from "../mapper/dtoBean/media/fromCreateUserMediaDtoToCreateUserMediaBean.ts";
import { fromCustomizeUserMediaDtoToCustomizeUserMediaBean } from "../mapper/dtoBean/media/fromCustomizeUserMediaDtoToCustomizeUserMediaBean.ts";
import { fromDeleteUserMediaDtoToUserMediaIdBean } from "../mapper/dtoBean/media/fromDeleteUserMediaDtoToUserMediaIdBean.ts";
import { fromSetEpisodesWatchedDtoToSetEpisodesWatchedBean } from "../mapper/dtoBean/media/fromSetEpisodesWatchedDtoToSetEpisodesWatchedBean.ts";
import { fromUpdateUserMediaDtoToUpdateUserMediaBean } from "../mapper/dtoBean/media/fromUpdateUserMediaDtoToUpdateUserMediaBean.ts";
import { fromUserMediaBeanToUserMediaDto } from "../mapper/dtoBean/media/fromUserMediaBeanToUserMediaDto.ts";
import { userMediaService } from "../service/userMediaService.ts";

export const userMediaController = {
	create: protectedRequestHandler<CreateUserMedia>(
		async (request, response, session) => {
			const userMedia = await userMediaService.createUserMedia(
				session.userId,
				fromCreateUserMediaDtoToCreateUserMediaBean(request.body),
			);

			return response
				.status(HttpStatutCodeSuccessEnum.CREATED)
				.json(fromUserMediaBeanToUserMediaDto(userMedia));
		},
	),

	customize: protectedRequestHandler<CustomizeUserMedia>(
		async (request, response, session) => {
			const userMedia = await userMediaService.customizeUserMedia(
				session.userId,
				fromCustomizeUserMediaDtoToCustomizeUserMediaBean(
					request.params,
					request.body,
				),
			);

			return response
				.status(HttpStatutCodeSuccessEnum.SUCCESS)
				.json(fromUserMediaBeanToUserMediaDto(userMedia));
		},
	),

	update: protectedRequestHandler<UpdateUserMedia>(
		async (request, response, session) => {
			const userMedia = await userMediaService.updateUserMedia(
				session.userId,
				fromUpdateUserMediaDtoToUpdateUserMediaBean(
					request.params,
					request.body,
				),
			);

			return response
				.status(HttpStatutCodeSuccessEnum.SUCCESS)
				.json(fromUserMediaBeanToUserMediaDto(userMedia));
		},
	),

	setEpisodesWatched: protectedRequestHandler<SetEpisodesWatched>(
		async (request, response, session) => {
			const userMedia = await userMediaService.setEpisodesWatched(
				session.userId,
				fromSetEpisodesWatchedDtoToSetEpisodesWatchedBean(
					request.params,
					request.body,
				),
			);

			return response
				.status(HttpStatutCodeSuccessEnum.SUCCESS)
				.json(fromUserMediaBeanToUserMediaDto(userMedia));
		},
	),

	delete: protectedRequestHandler<DeleteUserMedia>(
		async (request, response, session) => {
			await userMediaService.deleteUserMedia(
				session.userId,
				fromDeleteUserMediaDtoToUserMediaIdBean(request.params),
			);

			return response.status(HttpStatutCodeSuccessEnum.NO_CONTENT).end();
		},
	),
};
