import type { Transaction } from "sequelize";

import { DatabaseError } from "../../../../error/DatabaseError.ts";
import type { UpdateUserVersionBean } from "../../bean/updateUserVersionBean.type.ts";
import { UserVersion } from "../../models/UserVersion.ts";

// Seuls les champs donnés changent
export async function updateUserVersionQuery(
	id: number,
	changes: UpdateUserVersionBean["changes"],
	transaction: Transaction,
): Promise<void> {
	const definedChanges = Object.fromEntries(
		Object.entries(changes).filter(([, value]) => value !== undefined),
	);
	try {
		await UserVersion.update(definedChanges, { where: { id }, transaction });
	} catch (error) {
		throw new DatabaseError("Failed to update played version", {
			cause: error,
		});
	}
}
