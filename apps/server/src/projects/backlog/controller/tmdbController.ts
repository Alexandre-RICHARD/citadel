import type { GetMediaPosters } from "@citadel/specs/src/projects/backlog/endpoint/tmdb/getMediaPosters/getMediaPostersEndpoint.interface.ts";
import type { GetMoviePreview } from "@citadel/specs/src/projects/backlog/endpoint/tmdb/getMoviePreview/getMoviePreviewEndpoint.interface.ts";
import type { GetShowPreview } from "@citadel/specs/src/projects/backlog/endpoint/tmdb/getShowPreview/getShowPreviewEndpoint.interface.ts";
import type { SearchTmdbMedia } from "@citadel/specs/src/projects/backlog/endpoint/tmdb/searchTmdbMedia/searchTmdbMediaEndpoint.interface.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";

import { protectedRequestHandler } from "../../../common/routing/protectedRequestHandler.ts";
import { fromGetMediaPostersDtoToGetMediaPostersBean } from "../mapper/dtoBean/media/fromGetMediaPostersDtoToGetMediaPostersBean.ts";
import { fromMoviePreviewBeanToMoviePreviewDto } from "../mapper/dtoBean/media/fromMoviePreviewBeanToMoviePreviewDto.ts";
import { fromPosterPathsToMediaPostersDto } from "../mapper/dtoBean/media/fromPosterPathsToMediaPostersDto.ts";
import { fromSearchTmdbMediaDtoToSearchTmdbMediaBean } from "../mapper/dtoBean/media/fromSearchTmdbMediaDtoToSearchTmdbMediaBean.ts";
import { fromShowPreviewBeanToShowPreviewDto } from "../mapper/dtoBean/media/fromShowPreviewBeanToShowPreviewDto.ts";
import { fromTmdbIdDtoToTmdbIdBean } from "../mapper/dtoBean/media/fromTmdbIdDtoToTmdbIdBean.ts";
import { fromTmdbSearchResultBeanListToTmdbSearchResultListDto } from "../mapper/dtoBean/media/fromTmdbSearchResultBeanListToTmdbSearchResultListDto.ts";
import { tmdbService } from "../service/tmdbService.ts";

export const tmdbController = {
	search: protectedRequestHandler<SearchTmdbMedia>(
		async (request, response, session) => {
			const results = await tmdbService.searchMedia(
				session.userId,
				fromSearchTmdbMediaDtoToSearchTmdbMediaBean(request.query),
			);

			if (results.length === 0)
				return response.status(HttpStatutCodeSuccessEnum.NO_CONTENT).end();

			return response
				.status(HttpStatutCodeSuccessEnum.SUCCESS)
				.json(fromTmdbSearchResultBeanListToTmdbSearchResultListDto(results));
		},
	),

	getMoviePreview: protectedRequestHandler<GetMoviePreview>(
		async (request, response, session) => {
			const preview = await tmdbService.getMoviePreview(
				session.userId,
				fromTmdbIdDtoToTmdbIdBean(request.params),
			);

			return response
				.status(HttpStatutCodeSuccessEnum.SUCCESS)
				.json(fromMoviePreviewBeanToMoviePreviewDto(preview));
		},
	),

	getShowPreview: protectedRequestHandler<GetShowPreview>(
		async (request, response, session) => {
			const preview = await tmdbService.getShowPreview(
				session.userId,
				fromTmdbIdDtoToTmdbIdBean(request.params),
			);

			return response
				.status(HttpStatutCodeSuccessEnum.SUCCESS)
				.json(fromShowPreviewBeanToShowPreviewDto(preview));
		},
	),

	// Protégé pour le quota de TMDB, partagé par tous les comptes : les affiches d'un média ne dépendent d'aucun d'eux
	getPosters: protectedRequestHandler<GetMediaPosters>(
		async (request, response) => {
			const posterPaths = await tmdbService.getPosters(
				fromGetMediaPostersDtoToGetMediaPostersBean(request.params),
			);

			return response
				.status(HttpStatutCodeSuccessEnum.SUCCESS)
				.json(fromPosterPathsToMediaPostersDto(posterPaths));
		},
	),
};
