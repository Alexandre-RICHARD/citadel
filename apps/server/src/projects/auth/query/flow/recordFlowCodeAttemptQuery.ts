import { QueryTypes } from "sequelize";

import { sequelize } from "../../../../configuration/sequelize.ts";
import { DatabaseError } from "../../../../error/DatabaseError.ts";

/**
 * Compte un essai de code avant même de le comparer, en une seule requête : deux essais envoyés ensemble ne passent
 * jamais à deux sous la limite. false : tous les essais sont déjà faits
 */
export async function recordFlowCodeAttemptQuery(
	flowId: number,
	maxAttempts: number,
): Promise<boolean> {
	try {
		const [, affectedRows] = await sequelize.query(
			"UPDATE auth_flow SET attempts = attempts + 1 WHERE id = :flowId AND attempts < :maxAttempts",
			{ type: QueryTypes.UPDATE, replacements: { flowId, maxAttempts } },
		);
		return affectedRows === 1;
	} catch (error) {
		throw new DatabaseError("Failed to record a code attempt", {
			cause: error,
		});
	}
}
