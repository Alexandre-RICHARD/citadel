import type { GetBacklogOverview } from "@citadel/specs/src/projects/backlog/endpoint/overview/getBacklogOverview/getBacklogOverviewEndpoint.interface.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";

import { protectedRequestHandler } from "../../../common/routing/protectedRequestHandler.ts";
import { fromBacklogOverviewBeanToBacklogOverviewDto } from "../mapper/dtoBean/overview/fromBacklogOverviewBeanToBacklogOverviewDto.ts";
import { overviewService } from "../service/overviewService.ts";

export const overviewController = {
	get: protectedRequestHandler<GetBacklogOverview>(
		async (_request, response, session) => {
			const overview = await overviewService.getOverview(session.userId);

			return response
				.status(HttpStatutCodeSuccessEnum.SUCCESS)
				.json(fromBacklogOverviewBeanToBacklogOverviewDto(overview));
		},
	),
};
