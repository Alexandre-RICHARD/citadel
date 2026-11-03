import type { Transaction } from "sequelize";

import { DatabaseError } from "../../../../error/DatabaseError.ts";
import { RecoveryCode } from "../../models/RecoveryCode.ts";

// Plus de double authentification : plus de codes de secours
export async function deleteRecoveryCodesQuery(
	userId: number,
	transaction: Transaction,
): Promise<void> {
	try {
		await RecoveryCode.destroy({ where: { userId }, transaction });
	} catch (error) {
		throw new DatabaseError("Failed to delete recovery codes", {
			cause: error,
		});
	}
}
