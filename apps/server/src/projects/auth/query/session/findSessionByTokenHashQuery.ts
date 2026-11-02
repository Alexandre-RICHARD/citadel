import { DatabaseError } from "../../../../error/DatabaseError.ts";
import { Session } from "../../models/Session.ts";

export async function findSessionByTokenHashQuery(
	tokenHash: Buffer,
): Promise<Session | null> {
	try {
		return await Session.findOne({ where: { tokenHash } });
	} catch (error) {
		throw new DatabaseError("Failed to fetch session", { cause: error });
	}
}
