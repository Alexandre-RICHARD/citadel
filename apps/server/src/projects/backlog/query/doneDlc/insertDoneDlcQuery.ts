import type { Transaction } from "sequelize";

import { DatabaseError } from "../../../../error/DatabaseError.ts";
import { DoneDlc } from "../../models/DoneDlc.ts";

// Déjà fait : rien ne change
export async function insertDoneDlcQuery(
	userVersionId: number,
	dlcId: number,
	transaction: Transaction,
): Promise<void> {
	try {
		await DoneDlc.bulkCreate([{ userVersionId, dlcId }], {
			ignoreDuplicates: true,
			transaction,
		});
	} catch (error) {
		throw new DatabaseError("Failed to mark DLC as done", { cause: error });
	}
}
