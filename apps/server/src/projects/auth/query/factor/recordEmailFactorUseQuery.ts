import { FactorTypeEnum } from "@citadel/specs/src/projects/auth/enum/factorType.enum.ts";
import type { Transaction } from "sequelize";

import { DatabaseError } from "../../../../error/DatabaseError.ts";
import { Factor } from "../../models/Factor.ts";

// La date du dernier usage du facteur email, affichée dans la liste des facteurs
export async function recordEmailFactorUseQuery(
	userId: number,
	usedAt: Date,
	transaction: Transaction,
): Promise<void> {
	try {
		await Factor.update(
			{ lastUsedAt: usedAt },
			{ where: { userId, type: FactorTypeEnum.EMAIL }, transaction },
		);
	} catch (error) {
		throw new DatabaseError("Failed to record email factor use", {
			cause: error,
		});
	}
}
