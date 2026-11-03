import type { Transaction } from "sequelize";

import { DatabaseError } from "../../../../error/DatabaseError.ts";
import { RecoveryCode } from "../../models/RecoveryCode.ts";

// Les codes de secours du compte, tous remplacés : les anciens, utilisés ou non, ne valent plus
export async function replaceRecoveryCodesQuery(
	userId: number,
	codeHashes: Buffer[],
	transaction: Transaction,
): Promise<void> {
	try {
		await RecoveryCode.destroy({ where: { userId }, transaction });
		await RecoveryCode.bulkCreate(
			codeHashes.map((codeHash) => ({ userId, codeHash })),
			{ transaction },
		);
	} catch (error) {
		throw new DatabaseError("Failed to replace recovery codes", {
			cause: error,
		});
	}
}
