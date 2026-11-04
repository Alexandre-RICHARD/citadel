import { AuthErrorCodeEnum } from "@citadel/specs/src/projects/auth/error/authErrorCode.enum.ts";
import { type Transaction, UniqueConstraintError } from "sequelize";

import { ConflictError } from "../../../../error/ConflictError.ts";
import { DatabaseError } from "../../../../error/DatabaseError.ts";
import { User } from "../../models/User.ts";

// La nouvelle adresse d'un compte. Prise entre-temps : 409, le parcours reste ouvert
export async function updateUserEmailQuery(
	{ userId, email }: { userId: number; email: string },
	transaction: Transaction,
): Promise<void> {
	try {
		await User.update({ email }, { where: { id: userId }, transaction });
	} catch (error) {
		if (error instanceof UniqueConstraintError)
			throw new ConflictError(
				AuthErrorCodeEnum.EMAIL_TAKEN,
				"The email was registered in the meantime",
			);
		throw new DatabaseError("Failed to update email", { cause: error });
	}
}
