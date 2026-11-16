import type { Transaction } from "sequelize";

import { DatabaseError } from "../../../../error/DatabaseError.ts";
import { MediaCollection } from "../../models/MediaCollection.ts";
import { Movie } from "../../models/Movie.ts";
import type { TmdbMovieData } from "../../tmdb/type/tmdbMovieData.type.ts";

// Un film lu sur TMDB, et sa collection : ajoutés en base, ou remis à jour s'ils y sont déjà
export async function upsertMovieQuery(
	movie: TmdbMovieData,
	transaction: Transaction,
): Promise<void> {
	try {
		if (movie.collection !== null)
			await MediaCollection.upsert(movie.collection, { transaction });
		await Movie.upsert(
			{
				id: movie.id,
				title: movie.title,
				originalTitle: movie.originalTitle,
				originalLanguage: movie.originalLanguage,
				releaseDate: movie.releaseDate,
				runtimeMinutes: movie.runtimeMinutes,
				imdbId: movie.imdbId,
				posterPath: movie.posterPath,
				collectionId: movie.collection?.id ?? null,
			},
			{ transaction },
		);
	} catch (error) {
		throw new DatabaseError("Failed to store movie", { cause: error });
	}
}
