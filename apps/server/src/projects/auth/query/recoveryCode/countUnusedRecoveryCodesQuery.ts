import { DatabaseError } from "../../../../error/DatabaseError.ts";
import { RecoveryCode } from "../../models/RecoveryCode.ts";

export async function countUnusedRecoveryCodesQuery(
	userId: number,
): Promise<number> {
	try {
		return await RecoveryCode.count({ where: { userId, usedAt: null } });
	} catch (error) {
		throw new DatabaseError("Failed to count recovery codes", {
			cause: error,
		});
	}
}
