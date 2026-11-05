import type { GetAllSeries } from "@citadel/specs/src/projects/backlog/endpoint/series/getAllSeries/getAllSeriesEndpoint.interface.ts";
import type { GetSeriesEntries } from "@citadel/specs/src/projects/backlog/endpoint/series/getSeriesEntries/getSeriesEntriesEndpoint.interface.ts";
import type { ReorderSeries } from "@citadel/specs/src/projects/backlog/endpoint/series/reorderSeries/reorderSeriesEndpoint.interface.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";

import { protectedRequestHandler } from "../../../common/routing/protectedRequestHandler.ts";
import { fromGetSeriesEntriesDtoToGetSeriesEntriesBean } from "../mapper/dtoBean/series/fromGetSeriesEntriesDtoToGetSeriesEntriesBean.ts";
import { fromReorderSeriesDtoToReorderSeriesBean } from "../mapper/dtoBean/series/fromReorderSeriesDtoToReorderSeriesBean.ts";
import { fromSeriesBeanListToSeriesListDto } from "../mapper/dtoBean/series/fromSeriesBeanListToSeriesListDto.ts";
import { fromSeriesEntryBeanListToSeriesEntryListDto } from "../mapper/dtoBean/series/fromSeriesEntryBeanListToSeriesEntryListDto.ts";
import { seriesService } from "../service/seriesService.ts";

export const seriesController = {
	getAll: protectedRequestHandler<GetAllSeries>(
		async (_request, response, session) => {
			const series = await seriesService.getAllSeries(session.userId);

			if (series.length === 0)
				return response.status(HttpStatutCodeSuccessEnum.NO_CONTENT).end();

			return response
				.status(HttpStatutCodeSuccessEnum.SUCCESS)
				.json(fromSeriesBeanListToSeriesListDto(series));
		},
	),

	getEntries: protectedRequestHandler<GetSeriesEntries>(
		async (request, response, session) => {
			const entries = await seriesService.getSeriesEntries(
				session.userId,
				fromGetSeriesEntriesDtoToGetSeriesEntriesBean(request.params),
			);

			if (entries.length === 0)
				return response.status(HttpStatutCodeSuccessEnum.NO_CONTENT).end();

			return response
				.status(HttpStatutCodeSuccessEnum.SUCCESS)
				.json(fromSeriesEntryBeanListToSeriesEntryListDto(entries));
		},
	),

	reorder: protectedRequestHandler<ReorderSeries>(
		async (request, response, session) => {
			const entries = await seriesService.reorderSeries(
				session.userId,
				fromReorderSeriesDtoToReorderSeriesBean(request.params, request.body),
			);

			return response
				.status(HttpStatutCodeSuccessEnum.SUCCESS)
				.json(fromSeriesEntryBeanListToSeriesEntryListDto(entries));
		},
	),
};
