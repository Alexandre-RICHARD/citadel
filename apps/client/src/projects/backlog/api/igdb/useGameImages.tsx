import type { GetGameImages } from "@citadel/specs/src/projects/backlog/endpoint/igdb/getGameImages/getGameImagesEndpoint.interface";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum";
import { HttpMethodEnum } from "@citadel/specs/src/specUtils/httpMethod.enum";
import { useQuery } from "@tanstack/react-query";

import type { ApiError } from "../../../../common/api/error/ApiError";
import { fetchHandler } from "../../../../common/api/fetch/fetchHandler";
import { backlogQueryKeys } from "../backlogQueryKeys";

type GameImages = {
	// null en attendant IGDB
	imageIds: string[] | null;
	error: ApiError | null;
};

// Images proposées pour la miniature (cahier des charges, §8), relues sur IGDB à l'ouverture
export function useGameImages(igdbId: number): GameImages {
	const images = useQuery({
		queryKey: backlogQueryKeys.gameImages(igdbId),
		queryFn: async ({ signal }) =>
			(
				await fetchHandler<GetGameImages>(
					{
						url: `${ApiPrefixEnum.BACKLOG}/igdb/games/:igdbId/images`,
						method: HttpMethodEnum.GET,
						protected: false,
						pathParams: { igdbId },
					},
					{ signal },
				)
			).data.imageIds,
	});
	return {
		imageIds: images.data ?? null,
		error: images.error as ApiError | null,
	};
}
