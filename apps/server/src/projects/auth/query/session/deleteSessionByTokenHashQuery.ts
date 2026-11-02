import { DatabaseError } from "../../../../error/DatabaseError.ts";
import { Session } from "../../models/Session.ts";

export async function deleteSessionByTokenHashQuery(
	tokenHash: Buffer,
): Promise<void> {
	try {
		await Session.destroy({ where: { tokenHash } });
	} catch (error) {
		throw new DatabaseError("Failed to delete session", { cause: error });
	}
}
