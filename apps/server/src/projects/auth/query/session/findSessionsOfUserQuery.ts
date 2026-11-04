import { Op } from "sequelize";

import { DatabaseError } from "../../../../error/DatabaseError.ts";
import { Session } from "../../models/Session.ts";

// Les sessions du compte qui n'ont pas expiré (la purge ne passe que toutes les 15 minutes), la plus récemment active
// d'abord
export async function findSessionsOfUserQuery(
	userId: number,
	now: Date,
): Promise<Session[]> {
	try {
		return await Session.findAll({
			where: { userId, expiresAt: { [Op.gt]: now } },
			order: [
				["lastSeenAt", "DESC"],
				["id", "DESC"],
			],
		});
	} catch (error) {
		throw new DatabaseError("Failed to fetch the sessions of the user", {
			cause: error,
		});
	}
}
