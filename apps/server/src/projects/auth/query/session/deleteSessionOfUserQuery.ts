import { DatabaseError } from "../../../../error/DatabaseError.ts";
import { Session } from "../../models/Session.ts";

// Une session du compte, jamais celle d'un autre. false : aucune session de ce compte sous cet id
export async function deleteSessionOfUserQuery({
	userId,
	sessionId,
}: {
	userId: number;
	sessionId: number;
}): Promise<boolean> {
	try {
		return (await Session.destroy({ where: { userId, id: sessionId } })) > 0;
	} catch (error) {
		throw new DatabaseError("Failed to delete a session of the user", {
			cause: error,
		});
	}
}
