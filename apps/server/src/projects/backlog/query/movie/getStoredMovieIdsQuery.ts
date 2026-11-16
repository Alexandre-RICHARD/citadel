import { Op, type Transaction } from "sequelize";

import { DatabaseError } from "../../../../error/DatabaseError.ts";
import { Movie } from "../../models/Movie.ts";

// Parmi ces identifiants TMDB, les films déjà en base : ceux-là ne sont pas relus sur TMDB
export async function getStoredMovieIdsQuery(
	tmdbIds: number[],
	transaction: Transaction | null = null,
): Promise<Set<number>> {
	if (tmdbIds.length === 0) return new Set();
	try {
		const movies = await Movie.findAll({
			attributes: ["id"],
			where: { id: { [Op.in]: tmdbIds } },
			transaction,
		});
		return new Set(movies.map(({ id }) => id));
	} catch (error) {
		throw new DatabaseError("Failed to fetch stored movies", { cause: error });
	}
}
