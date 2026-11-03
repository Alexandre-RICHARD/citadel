import { FactorTypeEnum } from "@citadel/specs/src/projects/auth/enum/factorType.enum.ts";
import { Op } from "sequelize";

import { DatabaseError } from "../../../../error/DatabaseError.ts";
import { Factor } from "../../models/Factor.ts";

type PendingTotp = {
	userId: number;
	factorId: number;
	// Plus ancien, le TOTP n'attend plus son premier code : la purge l'efface
	createdAfter: Date;
};

// Le TOTP de ce compte qui attend son premier code ; null pour celui d'un autre, déjà actif ou trop ancien
export async function findPendingTotpFactorQuery({
	userId,
	factorId,
	createdAfter,
}: PendingTotp): Promise<Factor | null> {
	try {
		return await Factor.findOne({
			where: {
				id: factorId,
				userId,
				type: FactorTypeEnum.TOTP,
				confirmedAt: null,
				createdAt: { [Op.gt]: createdAfter },
			},
		});
	} catch (error) {
		throw new DatabaseError("Failed to fetch pending factor", {
			cause: error,
		});
	}
}
