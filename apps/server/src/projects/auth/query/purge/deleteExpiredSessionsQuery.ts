import { Op } from "sequelize";

import { DatabaseError } from "../../../../error/DatabaseError.ts";
import { Session } from "../../models/Session.ts";

// expires_at ne dépasse jamais le plafond (contrainte CHECK) : il suffit à dire qu'une session est finie
export async function deleteExpiredSessionsQuery(now: Date): Promise<void> {
	try {
		await Session.destroy({ where: { expiresAt: { [Op.lte]: now } } });
	} catch (error) {
		throw new DatabaseError("Failed to delete expired sessions", {
			cause: error,
		});
	}
}
