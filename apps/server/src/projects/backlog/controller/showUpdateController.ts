import type { ApplyShowUpdates } from "@citadel/specs/src/projects/backlog/endpoint/showUpdates/applyShowUpdates/applyShowUpdatesEndpoint.interface.ts";
import type { GetShowUpdates } from "@citadel/specs/src/projects/backlog/endpoint/showUpdates/getShowUpdates/getShowUpdatesEndpoint.interface.ts";
import type { RefreshOngoingShows } from "@citadel/specs/src/projects/backlog/endpoint/showUpdates/refreshOngoingShows/refreshOngoingShowsEndpoint.interface.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";

import { asyncRequestHandler } from "../../../common/routing/asyncRequestHandler.ts";
import { protectedRequestHandler } from "../../../common/routing/protectedRequestHandler.ts";
import { fromApplyShowUpdatesDtoToApplyShowUpdatesBean } from "../mapper/dtoBean/media/fromApplyShowUpdatesDtoToApplyShowUpdatesBean.ts";
import { fromShowUpdateBeanListToShowUpdateListDto } from "../mapper/dtoBean/media/fromShowUpdateBeanListToShowUpdateListDto.ts";
import { showUpdateService } from "../service/showUpdateService.ts";

export const showUpdateController = {
	get: protectedRequestHandler<GetShowUpdates>(
		async (_request, response, session) => {
			const updates = await showUpdateService.getShowUpdates(session.userId);

			if (updates.length === 0)
				return response.status(HttpStatutCodeSuccessEnum.NO_CONTENT).end();

			return response
				.status(HttpStatutCodeSuccessEnum.SUCCESS)
				.json(fromShowUpdateBeanListToShowUpdateListDto(updates));
		},
	),

	apply: protectedRequestHandler<ApplyShowUpdates>(
		async (request, response, session) => {
			const updatedCount = await showUpdateService.applyShowUpdates(
				session.userId,
				fromApplyShowUpdatesDtoToApplyShowUpdatesBean(request.body),
			);

			return response
				.status(HttpStatutCodeSuccessEnum.SUCCESS)
				.json({ updatedCount });
		},
	),

	// Route interne : le job media-tmdb d'infra-ops, par le réseau Docker (internalOnly)
	refreshOngoing: asyncRequestHandler<RefreshOngoingShows>(
		async (_request, response) => {
			const result = await showUpdateService.refreshOngoingShows();

			return response.status(HttpStatutCodeSuccessEnum.SUCCESS).json(result);
		},
	),
};
