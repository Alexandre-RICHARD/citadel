import { Op } from "sequelize";

import { DatabaseError } from "../../../../error/DatabaseError.ts";
import { Factor } from "../../models/Factor.ts";

// Les facteurs ajoutés avant `createdBefore` dont le premier code n'a jamais été validé
export async function deleteUnconfirmedFactorsQuery(
	createdBefore: Date,
): Promise<void> {
	try {
		await Factor.destroy({
			where: { confirmedAt: null, createdAt: { [Op.lt]: createdBefore } },
		});
	} catch (error) {
		throw new DatabaseError("Failed to delete unconfirmed factors", {
			cause: error,
		});
	}
}
