import type { Transaction } from "sequelize";

import { DatabaseError } from "../../../../error/DatabaseError.ts";
import { UserVersion } from "../../models/UserVersion.ts";

// Une version jouée est unique par version + plateforme (cahier des charges, §5)
export async function userVersionExistsQuery(
	versionId: number,
	platformId: number,
	transaction: Transaction,
): Promise<boolean> {
	try {
		return (
			(await UserVersion.count({
				where: { versionId, platformId },
				transaction,
			})) > 0
		);
	} catch (error) {
		throw new DatabaseError("Failed to check played version existence", {
			cause: error,
		});
	}
}
