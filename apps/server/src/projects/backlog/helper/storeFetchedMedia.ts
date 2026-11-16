import { MediaTypeEnum } from "@citadel/specs/src/projects/backlog/enum/mediaType.enum.ts";
import type { Transaction } from "sequelize";

import { upsertMovieQuery } from "../query/movie/upsertMovieQuery.ts";
import { upsertShowQuery } from "../query/tvShow/upsertShowQuery.ts";
import type { FetchedMedia } from "./fetchedMedia.type.ts";

// Enregistre en base (ou remet à jour) un film ou une série lu sur TMDB
export async function storeFetchedMedia(
	media: FetchedMedia,
	transaction: Transaction,
): Promise<void> {
	if (media.mediaType === MediaTypeEnum.MOVIE)
		await upsertMovieQuery(media.movie, transaction);
	else await upsertShowQuery(media.show, transaction);
}
