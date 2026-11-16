import type { GetMoviePreview } from "@citadel/specs/src/projects/backlog/endpoint/tmdb/getMoviePreview/getMoviePreviewEndpoint.interface";
import type { GetShowPreview } from "@citadel/specs/src/projects/backlog/endpoint/tmdb/getShowPreview/getShowPreviewEndpoint.interface";
import { MediaTypeEnum } from "@citadel/specs/src/projects/backlog/enum/mediaType.enum";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum";
import { HttpMethodEnum } from "@citadel/specs/src/specUtils/httpMethod.enum";
import { useQuery } from "@tanstack/react-query";

import type { ApiError } from "../../../../common/api/error/ApiError";
import { fetchHandler } from "../../../../common/api/fetch/fetchHandler";
import { backlogQueryKeys } from "../backlogQueryKeys";
import { fromMoviePreviewDtoToMediaPreviewFm } from "../model/media/fromMoviePreviewDtoToMediaPreviewFm";
import { fromShowPreviewDtoToMediaPreviewFm } from "../model/media/fromShowPreviewDtoToMediaPreviewFm";
import type { MediaPreviewFm } from "../model/media/mediaPreviewFm.type";

type MediaPreview = {
	// undefined tant qu'elle n'est pas lue
	data: MediaPreviewFm | undefined;
	error: ApiError | null;
};

// Lit la fiche d'un film ou d'une série sur TMDB, par le serveur
async function fetchMediaPreview(
	mediaType: MediaTypeEnum,
	tmdbId: number,
	signal: AbortSignal,
): Promise<MediaPreviewFm> {
	if (mediaType === MediaTypeEnum.MOVIE)
		return fromMoviePreviewDtoToMediaPreviewFm(
			(
				await fetchHandler<GetMoviePreview>(
					{
						url: `${ApiPrefixEnum.BACKLOG}/tmdb/movies/:tmdbId`,
						method: HttpMethodEnum.GET,
						protected: true,
						pathParams: { tmdbId },
					},
					{ signal },
				)
			).data,
		);
	return fromShowPreviewDtoToMediaPreviewFm(
		(
			await fetchHandler<GetShowPreview>(
				{
					url: `${ApiPrefixEnum.BACKLOG}/tmdb/shows/:tmdbId`,
					method: HttpMethodEnum.GET,
					protected: true,
					pathParams: { tmdbId },
				},
				{ signal },
			)
		).data,
	);
}

// La fiche d'un film ou d'une série, lue à l'ouverture de la modale d'ajout
export function useMediaPreview(
	mediaType: MediaTypeEnum,
	tmdbId: number,
): MediaPreview {
	const preview = useQuery({
		queryKey: backlogQueryKeys.mediaPreview(mediaType, tmdbId),
		queryFn: async ({ signal }) => fetchMediaPreview(mediaType, tmdbId, signal),
	});
	return { data: preview.data, error: preview.error as ApiError | null };
}
