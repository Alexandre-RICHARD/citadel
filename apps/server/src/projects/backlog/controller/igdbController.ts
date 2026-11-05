import type { GetGameImages } from "@citadel/specs/src/projects/backlog/endpoint/igdb/getGameImages/getGameImagesEndpoint.interface.ts";
import type { GetGamePreview } from "@citadel/specs/src/projects/backlog/endpoint/igdb/getGamePreview/getGamePreviewEndpoint.interface.ts";
import type { SearchIgdbGames } from "@citadel/specs/src/projects/backlog/endpoint/igdb/searchIgdbGames/searchIgdbGamesEndpoint.interface.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";

import { protectedRequestHandler } from "../../../common/routing/protectedRequestHandler.ts";
import { fromGamePreviewBeanToGamePreviewDto } from "../mapper/dtoBean/igdb/fromGamePreviewBeanToGamePreviewDto.ts";
import { fromGetGameImagesDtoToGetGameImagesBean } from "../mapper/dtoBean/igdb/fromGetGameImagesDtoToGetGameImagesBean.ts";
import { fromGetGamePreviewDtoToGetGamePreviewBean } from "../mapper/dtoBean/igdb/fromGetGamePreviewDtoToGetGamePreviewBean.ts";
import { fromImageIdsToGameImagesDto } from "../mapper/dtoBean/igdb/fromImageIdsToGameImagesDto.ts";
import { fromSearchIgdbGamesDtoToSearchIgdbGamesBean } from "../mapper/dtoBean/igdb/fromSearchIgdbGamesDtoToSearchIgdbGamesBean.ts";
import { fromSearchResultBeanListToIgdbSearchResultListDto } from "../mapper/dtoBean/igdb/fromSearchResultBeanListToIgdbSearchResultListDto.ts";
import { igdbService } from "../service/igdbService.ts";

export const igdbController = {
	search: protectedRequestHandler<SearchIgdbGames>(
		async (request, response, session) => {
			const results = await igdbService.searchGames(
				session.userId,
				fromSearchIgdbGamesDtoToSearchIgdbGamesBean(request.query),
			);

			if (results.length === 0)
				return response.status(HttpStatutCodeSuccessEnum.NO_CONTENT).end();

			return response
				.status(HttpStatutCodeSuccessEnum.SUCCESS)
				.json(fromSearchResultBeanListToIgdbSearchResultListDto(results));
		},
	),

	getPreview: protectedRequestHandler<GetGamePreview>(
		async (request, response, session) => {
			const preview = await igdbService.getGamePreview(
				session.userId,
				fromGetGamePreviewDtoToGetGamePreviewBean(request.params),
			);

			return response
				.status(HttpStatutCodeSuccessEnum.SUCCESS)
				.json(fromGamePreviewBeanToGamePreviewDto(preview));
		},
	),

	// Protégé pour le quota d'IGDB, partagé par tous les comptes : les images d'un jeu ne dépendent d'aucun d'eux
	getImages: protectedRequestHandler<GetGameImages>(
		async (request, response) => {
			const imageIds = await igdbService.getGameImages(
				fromGetGameImagesDtoToGetGameImagesBean(request.params),
			);

			return response
				.status(HttpStatutCodeSuccessEnum.SUCCESS)
				.json(fromImageIdsToGameImagesDto(imageIds));
		},
	),
};
