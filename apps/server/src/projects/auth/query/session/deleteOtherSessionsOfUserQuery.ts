import { Op, type Transaction } from "sequelize";

import { DatabaseError } from "../../../../error/DatabaseError.ts";
import { Session } from "../../models/Session.ts";

// Toutes les sessions du compte sauf une (celle d'où la demande est faite). Renvoie le nombre de sessions fermées
export async function deleteOtherSessionsOfUserQuery(
	{ userId, keptSessionId }: { userId: number; keptSessionId: number },
	transaction?: Transaction,
): Promise<number> {
	try {
		return await Session.destroy({
			where: { userId, id: { [Op.ne]: keptSessionId } },
			...(transaction === undefined ? {} : { transaction }),
		});
	} catch (error) {
		throw new DatabaseError("Failed to delete the other sessions of the user", {
			cause: error,
		});
	}
}
