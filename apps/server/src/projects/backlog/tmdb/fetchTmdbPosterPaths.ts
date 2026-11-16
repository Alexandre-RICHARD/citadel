import { MediaTypeEnum } from "@citadel/specs/src/projects/backlog/enum/mediaType.enum.ts";

import { listTmdbPosterPaths } from "./listTmdbPosterPaths.ts";
import { tmdbClient } from "./tmdbClient.ts";
import type { TmdbImagesResponse } from "./type/tmdbImagesResponse.type.ts";

type PosterOwner = {
	poster_path: string | null;
	images?: TmdbImagesResponse;
};

/**
 * Les affiches d'un film ou d'une série, pour choisir la miniature : celle que TMDB met en avant d'abord, puis celles
 * en français, en anglais et sans texte. null : TMDB ne connaît pas (ou plus) ce média
 */
export async function fetchTmdbPosterPaths(
	mediaType: MediaTypeEnum,
	tmdbId: number,
): Promise<string[] | null> {
	const kind = mediaType === MediaTypeEnum.MOVIE ? "movie" : "tv";
	const media = await tmdbClient.get<PosterOwner>(`/${kind}/${tmdbId}`, {
		append_to_response: "images",
		include_image_language: "fr,en,null",
	});
	if (media === null) return null;
	return listTmdbPosterPaths(
		media.poster_path,
		media.images ?? { posters: [] },
	);
}
