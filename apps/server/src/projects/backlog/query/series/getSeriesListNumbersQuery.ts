import { DatabaseError } from "../../../../error/DatabaseError.ts";
import { UserGame } from "../../models/UserGame.ts";

// Numéros des jeux du backlog du compte dans plusieurs séries : chaque ligne affiche le sien avec les décimales de sa famille
export async function getSeriesListNumbersQuery(
	userId: number,
	seriesIds: number[],
): Promise<UserGame[]> {
	if (seriesIds.length === 0) return [];

	try {
		return await UserGame.findAll({
			attributes: ["gameId", "seriesId", "seriesNumber"],
			where: { userId, seriesId: seriesIds },
		});
	} catch (error) {
		throw new DatabaseError("Failed to fetch series numbers", {
			cause: error,
		});
	}
}
