import type { Transaction } from "sequelize";

import { DatabaseError } from "../../../../error/DatabaseError.ts";
import { Factor } from "../../models/Factor.ts";

type FactorSecret = {
	factorId: number;
	secretEncrypted: Buffer;
	keyVersion: number;
};

// Le secret chiffré d'un TOTP, écrit après sa création : son id fait partie de la donnée associée du chiffrement
export async function writeFactorSecretQuery(
	{ factorId, secretEncrypted, keyVersion }: FactorSecret,
	transaction: Transaction,
): Promise<void> {
	try {
		await Factor.update(
			{ secretEncrypted, keyVersion },
			{ where: { id: factorId }, transaction },
		);
	} catch (error) {
		throw new DatabaseError("Failed to write factor secret", { cause: error });
	}
}
