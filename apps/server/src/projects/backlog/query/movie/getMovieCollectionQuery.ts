import type { Transaction } from "sequelize";

import { DatabaseError } from "../../../../error/DatabaseError.ts";
import { MediaCollection } from "../../models/MediaCollection.ts";
import { Movie } from "../../models/Movie.ts";

// La collection TMDB d'un film en base, qui propose une saga ; null s'il n'en a pas
export async function getMovieCollectionQuery(
	movieId: number,
	transaction: Transaction | null = null,
): Promise<{ id: number; name: string } | null> {
	try {
		const movie = await Movie.findByPk(movieId, {
			attributes: ["id", "collectionId"],
			include: [{ model: MediaCollection, as: "collection" }],
			transaction,
		});
		const collection = movie?.collection ?? null;
		return collection === null
			? null
			: { id: collection.id, name: collection.name };
	} catch (error) {
		throw new DatabaseError("Failed to fetch movie collection", {
			cause: error,
		});
	}
}
