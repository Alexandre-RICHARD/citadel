import type { Transaction } from "sequelize";

import { DatabaseError } from "../../../../error/DatabaseError.ts";
import { Flow } from "../../models/Flow.ts";

// Le parcours est terminé : son cookie ne mène plus à rien
export async function deleteFlowQuery(
	flowId: number,
	transaction: Transaction,
): Promise<void> {
	try {
		await Flow.destroy({ where: { id: flowId }, transaction });
	} catch (error) {
		throw new DatabaseError("Failed to delete flow", { cause: error });
	}
}
