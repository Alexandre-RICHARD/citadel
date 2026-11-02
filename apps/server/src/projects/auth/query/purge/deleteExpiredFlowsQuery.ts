import { Op } from "sequelize";

import { DatabaseError } from "../../../../error/DatabaseError.ts";
import { Flow } from "../../models/Flow.ts";

export async function deleteExpiredFlowsQuery(now: Date): Promise<void> {
	try {
		await Flow.destroy({ where: { expiresAt: { [Op.lte]: now } } });
	} catch (error) {
		throw new DatabaseError("Failed to delete expired flows", {
			cause: error,
		});
	}
}
