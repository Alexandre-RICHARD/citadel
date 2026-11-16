import type { Transaction } from "sequelize";

import { DatabaseError } from "../../../../error/DatabaseError.ts";
import { MediaCollection } from "../../models/MediaCollection.ts";
import { Movie } from "../../models/Movie.ts";
import type { TmdbMovieData } from "../../tmdb/type/tmdbMovieData.type.ts";

// Lots raisonnables pour un import de plusieurs milliers de films
const ROWS_PER_INSERT = 500;

/**
 * Des films lus sur TMDB, et leurs collections : ajoutés en base, ou remis à jour s'ils y sont déjà. En lots, pour
 * qu'un import de plusieurs milliers de films ne fasse que quelques requêtes
 */
export async function upsertMoviesQuery(
	movies: TmdbMovieData[],
	transaction: Transaction,
): Promise<void> {
	const collections = [
		...new Map(
			movies.flatMap(({ collection }) =>
				collection === null ? [] : [[collection.id, collection] as const],
			),
		).values(),
	];
	try {
		for (let start = 0; start < collections.length; start += ROWS_PER_INSERT)
			// eslint-disable-next-line no-await-in-loop -- les lots d'une même transaction passent l'un après l'autre
			await MediaCollection.bulkCreate(
				collections.slice(start, start + ROWS_PER_INSERT),
				{ updateOnDuplicate: ["name", "updatedAt"], transaction },
			);
		for (let start = 0; start < movies.length; start += ROWS_PER_INSERT)
			// eslint-disable-next-line no-await-in-loop -- idem
			await Movie.bulkCreate(
				movies
					.slice(start, start + ROWS_PER_INSERT)
					.map(({ collection, ...movie }) => ({
						...movie,
						collectionId: collection?.id ?? null,
					})),
				{
					updateOnDuplicate: [
						"title",
						"originalTitle",
						"originalLanguage",
						"releaseDate",
						"runtimeMinutes",
						"imdbId",
						"posterPath",
						"collectionId",
						"updatedAt",
					],
					transaction,
				},
			);
	} catch (error) {
		throw new DatabaseError("Failed to store movies", { cause: error });
	}
}
