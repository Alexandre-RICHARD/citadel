import { AuthErrorCodeEnum } from "@citadel/specs/src/projects/auth/error/authErrorCode.enum.ts";
import { type Transaction, UniqueConstraintError } from "sequelize";

import { ConflictError } from "../../../../error/ConflictError.ts";
import { DatabaseError } from "../../../../error/DatabaseError.ts";
import { User } from "../../models/User.ts";

type UserRow = {
	email: string;
	username: string;
	passwordHash: string;
	createdAt: Date;
};

// Contrainte d'unicité de V014 ; l'autre, celle de l'email
const USERNAME_CONSTRAINT = "uq_auth_user_username";

function isUsernameTaken(error: UniqueConstraintError): boolean {
	const original: unknown = error.parent;
	return (
		Object.keys(error.fields).includes(USERNAME_CONSTRAINT) ||
		(original instanceof Error &&
			original.message.includes(USERNAME_CONSTRAINT))
	);
}

// Renvoie l'id créé. Pseudo ou adresse pris entre-temps : 409, le parcours reste ouvert
export async function createUserQuery(
	row: UserRow,
	transaction: Transaction,
): Promise<number> {
	try {
		const user = await User.create(
			{
				email: row.email,
				username: row.username,
				passwordHash: row.passwordHash,
				passwordChangedAt: row.createdAt,
			},
			{ transaction },
		);
		return user.id;
	} catch (error) {
		if (error instanceof UniqueConstraintError)
			throw isUsernameTaken(error)
				? new ConflictError(
						AuthErrorCodeEnum.USERNAME_TAKEN,
						"The username was taken in the meantime",
					)
				: new ConflictError(
						AuthErrorCodeEnum.EMAIL_TAKEN,
						"The email was registered in the meantime",
					);
		throw new DatabaseError("Failed to create user", { cause: error });
	}
}
