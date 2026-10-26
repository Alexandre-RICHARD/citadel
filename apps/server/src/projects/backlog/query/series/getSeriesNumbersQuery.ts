import type { SeriesEntry } from "@citadel/specs/src/projects/backlog/rule/seriesNumber/seriesEntry.type.ts";
import type { Transaction } from "sequelize";

import { DatabaseError } from "../../../../error/DatabaseError.ts";
import { UserGame } from "../../models/UserGame.ts";

/**
 * Numéros des jeux du backlog d'une série. Avec `transaction`, leurs lignes sont verrouillées jusqu'à la fin : deux
 * placements simultanés dans la même série se font l'un après l'autre, sans donner deux fois le même numéro
 */
export async function getSeriesNumbersQuery(
	seriesId: number,
	transaction: Transaction | null = null,
): Promise<SeriesEntry[]> {
	try {
		const userGames = await UserGame.findAll({
			attributes: ["gameId", "seriesNumber"],
			where: { seriesId },
			order: [["seriesNumber", "ASC"]],
			transaction,
			...(transaction !== null && { lock: transaction.LOCK.UPDATE }),
		});
		return userGames.flatMap(({ gameId, seriesNumber }) =>
			seriesNumber === null ? [] : [{ gameId, seriesNumber }],
		);
	} catch (error) {
		throw new DatabaseError("Failed to fetch series numbers", {
			cause: error,
		});
	}
}
