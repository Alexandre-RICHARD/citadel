import type { Transaction } from "sequelize";

import { DatabaseError } from "../../../../error/DatabaseError.ts";
import { Factor } from "../../models/Factor.ts";

/**
 * Supprime le facteur de ce compte et dit s'il était actif (un TOTP qui attendait son premier code ne protégeait
 * rien). null : aucun facteur de ce compte sous cet id, jamais celui d'un autre
 */
export async function deleteFactorQuery(
	userId: number,
	factorId: number,
	transaction: Transaction,
): Promise<{ wasConfirmed: boolean } | null> {
	try {
		const factor = await Factor.findOne({
			attributes: ["id", "confirmedAt"],
			where: { id: factorId, userId },
			transaction,
		});
		if (factor === null) return null;
		await factor.destroy({ transaction });
		return { wasConfirmed: factor.confirmedAt !== null };
	} catch (error) {
		throw new DatabaseError("Failed to delete factor", { cause: error });
	}
}
