import { Op, type Transaction } from "sequelize";

import { DatabaseError } from "../../../../error/DatabaseError.ts";
import { TvShow } from "../../models/TvShow.ts";

// Parmi ces identifiants TMDB, les séries déjà en base : celles-là ne sont pas relues sur TMDB
export async function getStoredShowIdsQuery(
	tmdbIds: number[],
	transaction: Transaction | null = null,
): Promise<Set<number>> {
	if (tmdbIds.length === 0) return new Set();
	try {
		const shows = await TvShow.findAll({
			attributes: ["id"],
			where: { id: { [Op.in]: tmdbIds } },
			transaction,
		});
		return new Set(shows.map(({ id }) => id));
	} catch (error) {
		throw new DatabaseError("Failed to fetch stored shows", { cause: error });
	}
}
