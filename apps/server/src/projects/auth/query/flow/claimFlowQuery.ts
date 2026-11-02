import type { Transaction } from "sequelize";

import { DatabaseError } from "../../../../error/DatabaseError.ts";
import { Flow } from "../../models/Flow.ts";

// Supprime le parcours pour le terminer. false : quelqu'un l'a terminé juste avant (deux envois du même formulaire)
export async function claimFlowQuery(
	flowId: number,
	transaction: Transaction,
): Promise<boolean> {
	try {
		return (await Flow.destroy({ where: { id: flowId }, transaction })) === 1;
	} catch (error) {
		throw new DatabaseError("Failed to claim flow", { cause: error });
	}
}
