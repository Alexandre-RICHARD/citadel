import { Op } from "sequelize";

import { DatabaseError } from "../../../../error/DatabaseError.ts";
import { AuthEvent } from "../../models/AuthEvent.ts";

export async function deleteAuthEventsBeforeQuery(
	createdBefore: Date,
): Promise<void> {
	try {
		await AuthEvent.destroy({
			where: { createdAt: { [Op.lt]: createdBefore } },
		});
	} catch (error) {
		throw new DatabaseError("Failed to delete old auth events", {
			cause: error,
		});
	}
}
