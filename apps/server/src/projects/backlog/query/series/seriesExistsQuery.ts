import type { Transaction } from "sequelize";

import { DatabaseError } from "../../../../error/DatabaseError.ts";
import { Series } from "../../models/Series.ts";
import { visibleSeries } from "./visibleSeries.ts";

// La série d'un autre compte n'existe pas pour celui-ci

export async function seriesExistsQuery(
	userId: number,
	seriesId: number,
	transaction: Transaction | null = null,
): Promise<boolean> {
	try {
		return (
			(await Series.count({
				where: { id: seriesId, ...visibleSeries(userId) },
				transaction,
			})) > 0
		);
	} catch (error) {
		throw new DatabaseError("Failed to check series existence", {
			cause: error,
		});
	}
}
