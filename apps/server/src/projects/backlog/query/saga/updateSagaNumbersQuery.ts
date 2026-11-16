import type { SeriesEntry } from "@citadel/specs/src/projects/backlog/helper/seriesNumber/seriesEntry.type.ts";
import type { Transaction } from "sequelize";

import { DatabaseError } from "../../../../error/DatabaseError.ts";
import { UserMedia } from "../../models/UserMedia.ts";

// Nouveaux numéros de médias du compte dans une même saga ; `gameId` porte l'id de la ligne (getSagaNumbersQuery)
export async function updateSagaNumbersQuery(
	userId: number,
	entries: SeriesEntry[],
	transaction: Transaction,
): Promise<void> {
	try {
		await Promise.all(
			entries.map(({ gameId, seriesNumber }) =>
				UserMedia.update(
					{ sagaNumber: seriesNumber },
					{ where: { userId, id: gameId }, transaction },
				),
			),
		);
	} catch (error) {
		throw new DatabaseError("Failed to update saga numbers", { cause: error });
	}
}
