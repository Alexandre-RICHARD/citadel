import { QueryTypes, type Transaction } from "sequelize";

import { sequelize } from "../../../../configuration/sequelize.ts";
import { DatabaseError } from "../../../../error/DatabaseError.ts";

type RecoveryCodeUse = {
	userId: number;
	codeHash: Buffer;
	usedAt: Date;
};

/**
 * Marque le code de secours comme utilisé, s'il est à ce compte et pas encore utilisé, en une seule requête : deux
 * connexions avec le même code n'en font qu'une. false : code inconnu de ce compte, ou déjà utilisé
 */
export async function useRecoveryCodeQuery(
	{ userId, codeHash, usedAt }: RecoveryCodeUse,
	transaction: Transaction | null = null,
): Promise<boolean> {
	try {
		const [, affectedRows] = await sequelize.query(
			`UPDATE auth_recovery_code SET used_at = :usedAt
			WHERE user_id = :userId AND code_hash = :codeHash AND used_at IS NULL`,
			{
				type: QueryTypes.UPDATE,
				replacements: { userId, codeHash, usedAt },
				transaction,
			},
		);
		return affectedRows === 1;
	} catch (error) {
		throw new DatabaseError("Failed to use recovery code", { cause: error });
	}
}
