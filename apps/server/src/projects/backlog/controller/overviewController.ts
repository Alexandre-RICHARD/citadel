import type { GetBacklogOverview } from "@citadel/specs/src/projects/backlog/endpoint/overview/getBacklogOverview/getBacklogOverviewEndpoint.interface.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";

import { asyncRequestHandler } from "../../../common/routing/asyncRequestHandler.ts";
import { fromBacklogOverviewBeanToBacklogOverviewDto } from "../mapper/dtoBean/overview/fromBacklogOverviewBeanToBacklogOverviewDto.ts";
import { overviewService } from "../service/overviewService.ts";

export const overviewController = {
	get: asyncRequestHandler<GetBacklogOverview>(async (_request, response) => {
		const overview = await overviewService.getOverview();

		return response
			.status(HttpStatutCodeSuccessEnum.SUCCESS)
			.json(fromBacklogOverviewBeanToBacklogOverviewDto(overview));
	}),
};
