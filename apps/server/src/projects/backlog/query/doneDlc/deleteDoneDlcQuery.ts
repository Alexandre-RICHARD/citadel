import type { Transaction } from "sequelize";

import { DatabaseError } from "../../../../error/DatabaseError.ts";
import { DoneDlc } from "../../models/DoneDlc.ts";

// Pas fait : rien ne change
export async function deleteDoneDlcQuery(
	userVersionId: number,
	dlcId: number,
	transaction: Transaction,
): Promise<void> {
	try {
		await DoneDlc.destroy({ where: { userVersionId, dlcId }, transaction });
	} catch (error) {
		throw new DatabaseError("Failed to mark DLC as not done", {
			cause: error,
		});
	}
}
