import type { Transaction } from "sequelize";

import { DatabaseError } from "../../../../error/DatabaseError.ts";
import { UserVersion } from "../../models/UserVersion.ts";

// Les DLC faits partent avec leur version jouée (ON DELETE CASCADE)
export async function deleteUserVersionsQuery(
	ids: number[],
	transaction: Transaction,
): Promise<void> {
	if (ids.length === 0) return;

	try {
		await UserVersion.destroy({ where: { id: ids }, transaction });
	} catch (error) {
		throw new DatabaseError("Failed to delete played versions", {
			cause: error,
		});
	}
}
