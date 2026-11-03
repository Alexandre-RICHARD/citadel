import type { FactorTypeEnum } from "@citadel/specs/src/projects/auth/enum/factorType.enum.ts";
import { type Transaction, UniqueConstraintError } from "sequelize";

import { DatabaseError } from "../../../../error/DatabaseError.ts";
import { Factor } from "../../models/Factor.ts";

type FactorRow = {
	userId: number;
	type: FactorTypeEnum;
	name: string;
	// null : le facteur attend son premier code
	confirmedAt: Date | null;
};

/**
 * Renvoie l'id créé, sans secret (un TOTP chiffre le sien avec cet id, juste après). null : le compte a déjà son
 * facteur mail, le seul qu'il peut avoir (contrainte d'unicité de V017)
 */
export async function createFactorQuery(
	row: FactorRow,
	transaction: Transaction,
): Promise<number | null> {
	try {
		const factor = await Factor.create(row, { transaction });
		return factor.id;
	} catch (error) {
		if (error instanceof UniqueConstraintError) return null;
		throw new DatabaseError("Failed to create factor", { cause: error });
	}
}
