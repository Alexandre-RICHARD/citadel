import type { GetMediaPosters } from "@citadel/specs/src/projects/backlog/endpoint/tmdb/getMediaPosters/getMediaPostersEndpoint.interface";
import type { MediaTypeEnum } from "@citadel/specs/src/projects/backlog/enum/mediaType.enum";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum";
import { HttpMethodEnum } from "@citadel/specs/src/specUtils/httpMethod.enum";
import { useQuery } from "@tanstack/react-query";

import type { ApiError } from "../../../../common/api/error/ApiError";
import { fetchHandler } from "../../../../common/api/fetch/fetchHandler";
import { backlogQueryKeys } from "../backlogQueryKeys";

type MediaPosters = {
	// null tant qu'elles ne sont pas lues
	posterPaths: string[] | null;
	error: ApiError | null;
};

// Les affiches TMDB d'un film ou d'une série, pour choisir sa miniature ; la première est celle que TMDB met en avant
export function useMediaPosters(
	mediaType: MediaTypeEnum,
	tmdbId: number,
): MediaPosters {
	const posters = useQuery({
		queryKey: backlogQueryKeys.mediaPosters(mediaType, tmdbId),
		queryFn: async ({ signal }) =>
			(
				await fetchHandler<GetMediaPosters>(
					{
						url: `${ApiPrefixEnum.BACKLOG}/tmdb/:mediaType/:tmdbId/posters`,
						method: HttpMethodEnum.GET,
						protected: true,
						pathParams: { mediaType, tmdbId },
					},
					{ signal },
				)
			).data,
		select: (data) => data.posterPaths,
	});
	return {
		posterPaths: posters.data ?? null,
		error: posters.error as ApiError | null,
	};
}
