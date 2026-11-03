import { QueryTypes, type Transaction } from "sequelize";

import { sequelize } from "../../../../configuration/sequelize.ts";
import { DatabaseError } from "../../../../error/DatabaseError.ts";

type TotpUse = {
	factorId: number;
	step: number;
	usedAt: Date;
	// Chiffré avec la clé précédente : le secret, rechiffré avec la clé du moment ; null sinon
	reencrypted: { secretEncrypted: Buffer; keyVersion: number } | null;
};

/**
 * Retient le pas du code accepté, s'il est plus récent que le dernier : deux connexions avec le même code n'en font
 * qu'une. false : ce pas, ou un plus récent, a servi entre-temps
 */
export async function recordTotpUseQuery(
	{ factorId, step, usedAt, reencrypted }: TotpUse,
	transaction: Transaction,
): Promise<boolean> {
	try {
		const [, affectedRows] = await sequelize.query(
			`UPDATE auth_factor
			SET last_used_step = :step, last_used_at = :usedAt,
				secret_encrypted = COALESCE(:secretEncrypted, secret_encrypted),
				key_version = COALESCE(:keyVersion, key_version)
			WHERE id = :factorId AND (last_used_step IS NULL OR last_used_step < :step)`,
			{
				type: QueryTypes.UPDATE,
				replacements: {
					factorId,
					step,
					usedAt,
					secretEncrypted: reencrypted?.secretEncrypted ?? null,
					keyVersion: reencrypted?.keyVersion ?? null,
				},
				transaction,
			},
		);
		return affectedRows === 1;
	} catch (error) {
		throw new DatabaseError("Failed to record TOTP use", { cause: error });
	}
}
