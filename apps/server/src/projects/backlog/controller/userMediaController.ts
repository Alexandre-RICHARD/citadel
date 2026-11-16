import type { CreateUserMedia } from "@citadel/specs/src/projects/backlog/endpoint/userMedia/createUserMedia/createUserMediaEndpoint.interface.ts";
import type { CustomizeUserMedia } from "@citadel/specs/src/projects/backlog/endpoint/userMedia/customizeUserMedia/customizeUserMediaEndpoint.interface.ts";
import type { DeleteUserMedia } from "@citadel/specs/src/projects/backlog/endpoint/userMedia/deleteUserMedia/deleteUserMediaEndpoint.interface.ts";
import type { GetAllUserMedia } from "@citadel/specs/src/projects/backlog/endpoint/userMedia/getAllUserMedia/getAllUserMediaEndpoint.interface.ts";
import type { GetShowSeasons } from "@citadel/specs/src/projects/backlog/endpoint/userMedia/getShowSeasons/getShowSeasonsEndpoint.interface.ts";
import type { SetEpisodesWatched } from "@citadel/specs/src/projects/backlog/endpoint/userMedia/setEpisodesWatched/setEpisodesWatchedEndpoint.interface.ts";
import type { UpdateUserMedia } from "@citadel/specs/src/projects/backlog/endpoint/userMedia/updateUserMedia/updateUserMediaEndpoint.interface.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";

import { protectedRequestHandler } from "../../../common/routing/protectedRequestHandler.ts";
import { fromCreateUserMediaDtoToCreateUserMediaBean } from "../mapper/dtoBean/media/fromCreateUserMediaDtoToCreateUserMediaBean.ts";
import { fromCustomizeUserMediaDtoToCustomizeUserMediaBean } from "../mapper/dtoBean/media/fromCustomizeUserMediaDtoToCustomizeUserMediaBean.ts";
import { fromDeleteUserMediaDtoToUserMediaIdBean } from "../mapper/dtoBean/media/fromDeleteUserMediaDtoToUserMediaIdBean.ts";
import { fromGetAllUserMediaDtoToGetAllUserMediaBean } from "../mapper/dtoBean/media/fromGetAllUserMediaDtoToGetAllUserMediaBean.ts";
import { fromGetShowSeasonsDtoToUserMediaIdBean } from "../mapper/dtoBean/media/fromGetShowSeasonsDtoToUserMediaIdBean.ts";
import { fromSetEpisodesWatchedDtoToSetEpisodesWatchedBean } from "../mapper/dtoBean/media/fromSetEpisodesWatchedDtoToSetEpisodesWatchedBean.ts";
import { fromShowSeasonBeanListToShowSeasonListDto } from "../mapper/dtoBean/media/fromShowSeasonBeanListToShowSeasonListDto.ts";
import { fromUpdateUserMediaDtoToUpdateUserMediaBean } from "../mapper/dtoBean/media/fromUpdateUserMediaDtoToUpdateUserMediaBean.ts";
import { fromUserMediaBeanToUserMediaDto } from "../mapper/dtoBean/media/fromUserMediaBeanToUserMediaDto.ts";
import { fromUserMediaPageBeanToUserMediaListDto } from "../mapper/dtoBean/media/fromUserMediaPageBeanToUserMediaListDto.ts";
import { userMediaService } from "../service/userMediaService.ts";

export const userMediaController = {
	// Un backlog vide répond sans contenu ; une page vide (filtres) garde le résumé de tout le backlog
	getAll: protectedRequestHandler<GetAllUserMedia>(
		async (request, response, session) => {
			const page = await userMediaService.getAllUserMedia(
				session.userId,
				fromGetAllUserMediaDtoToGetAllUserMediaBean(request.query),
			);

			if (page.movieCount + page.showCount === 0)
				return response.status(HttpStatutCodeSuccessEnum.NO_CONTENT).end();

			return response
				.status(HttpStatutCodeSuccessEnum.SUCCESS)
				.json(fromUserMediaPageBeanToUserMediaListDto(page));
		},
	),

	getSeasons: protectedRequestHandler<GetShowSeasons>(
		async (request, response, session) => {
			const seasons = await userMediaService.getShowSeasons(
				session.userId,
				fromGetShowSeasonsDtoToUserMediaIdBean(request.params),
			);

			return response
				.status(HttpStatutCodeSuccessEnum.SUCCESS)
				.json(fromShowSeasonBeanListToShowSeasonListDto(seasons));
		},
	),

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
