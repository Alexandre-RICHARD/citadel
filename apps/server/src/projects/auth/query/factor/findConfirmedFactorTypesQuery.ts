import type { FactorTypeEnum } from "@citadel/specs/src/projects/auth/enum/factorType.enum.ts";
import { Op } from "sequelize";

import { DatabaseError } from "../../../../error/DatabaseError.ts";
import { Factor } from "../../models/Factor.ts";

// Les types des seconds facteurs actifs du compte, un par facteur. Un facteur dont le premier code n'est pas validé
// ne compte pas
export async function findConfirmedFactorTypesQuery(
	userId: number,
): Promise<FactorTypeEnum[]> {
	try {
		const factors = await Factor.findAll({
			attributes: ["type"],
			where: { userId, confirmedAt: { [Op.ne]: null } },
		});
		return factors.map((factor) => factor.type);
	} catch (error) {
		throw new DatabaseError("Failed to fetch the factors of the user", {
			cause: error,
		});
	}
}
