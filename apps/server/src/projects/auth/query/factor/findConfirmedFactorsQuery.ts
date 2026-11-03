import { Op } from "sequelize";

import { DatabaseError } from "../../../../error/DatabaseError.ts";
import { Factor } from "../../models/Factor.ts";

// Les seconds facteurs actifs du compte, du plus ancien au plus récent ; un TOTP avec son secret chiffré
export async function findConfirmedFactorsQuery(
	userId: number,
): Promise<Factor[]> {
	try {
		return await Factor.findAll({
			where: { userId, confirmedAt: { [Op.ne]: null } },
			order: [
				["createdAt", "ASC"],
				["id", "ASC"],
			],
		});
	} catch (error) {
		throw new DatabaseError("Failed to fetch the factors of the user", {
			cause: error,
		});
	}
}
