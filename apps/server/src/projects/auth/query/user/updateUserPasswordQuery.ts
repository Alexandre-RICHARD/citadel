import type { Transaction } from "sequelize";

import { DatabaseError } from "../../../../error/DatabaseError.ts";
import { User } from "../../models/User.ts";

type PasswordChange = {
	userId: number;
	passwordHash: string;
	changedAt: Date;
};

// Un nouveau mot de passe, choisi par son propriétaire
export async function updateUserPasswordQuery(
	{ userId, passwordHash, changedAt }: PasswordChange,
	transaction: Transaction,
): Promise<void> {
	try {
		await User.update(
			{ passwordHash, passwordChangedAt: changedAt },
			{ where: { id: userId }, transaction },
		);
	} catch (error) {
		throw new DatabaseError("Failed to update password", { cause: error });
	}
}
