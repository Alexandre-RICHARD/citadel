import type { Transaction } from "sequelize";

import { DatabaseError } from "../../../../error/DatabaseError.ts";
import { UserMedia } from "../../models/UserMedia.ts";

export async function deleteUserMediaQuery(
	userId: number,
	userMediaId: number,
	transaction: Transaction,
): Promise<void> {
	try {
		await UserMedia.destroy({
			where: { id: userMediaId, userId },
			transaction,
		});
	} catch (error) {
		throw new DatabaseError("Failed to remove media from the backlog", {
			cause: error,
		});
	}
}
