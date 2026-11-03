import { QueryTypes, type Transaction } from "sequelize";

import { sequelize } from "../../../../configuration/sequelize.ts";
import { DatabaseError } from "../../../../error/DatabaseError.ts";

type Confirmation = {
	factorId: number;
	// Le pas du premier code : il ne resservira pas pour se connecter
	usedStep: number;
	confirmedAt: Date;
};

// Active le TOTP, une seule fois : false s'il l'a été entre-temps (deux envois du même code)
export async function confirmFactorQuery(
	{ factorId, usedStep, confirmedAt }: Confirmation,
	transaction: Transaction,
): Promise<boolean> {
	try {
		const [, affectedRows] = await sequelize.query(
			`UPDATE auth_factor SET confirmed_at = :confirmedAt, last_used_step = :usedStep
			WHERE id = :factorId AND confirmed_at IS NULL`,
			{
				type: QueryTypes.UPDATE,
				replacements: { factorId, usedStep, confirmedAt },
				transaction,
			},
		);
		return affectedRows === 1;
	} catch (error) {
		throw new DatabaseError("Failed to confirm factor", { cause: error });
	}
}
