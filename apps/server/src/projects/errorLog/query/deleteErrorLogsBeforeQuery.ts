import { Op } from "sequelize";

import { DatabaseError } from "../../../error/DatabaseError.ts";
import { ErrorLog } from "../models/ErrorLog.ts";

export async function deleteErrorLogsBeforeQuery(
	createdBefore: Date,
): Promise<void> {
	try {
		await ErrorLog.destroy({
			where: { createdAt: { [Op.lt]: createdBefore } },
		});
	} catch (error) {
		throw new DatabaseError("Failed to delete old error logs", {
			cause: error,
		});
	}
}
