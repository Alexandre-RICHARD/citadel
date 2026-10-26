import type { Transaction } from "sequelize";

import { DatabaseError } from "../../../../error/DatabaseError.ts";
import { Series } from "../../models/Series.ts";

export async function seriesExistsQuery(
	seriesId: number,
	transaction: Transaction | null = null,
): Promise<boolean> {
	try {
		return (await Series.count({ where: { id: seriesId }, transaction })) > 0;
	} catch (error) {
		throw new DatabaseError("Failed to check series existence", {
			cause: error,
		});
	}
}
