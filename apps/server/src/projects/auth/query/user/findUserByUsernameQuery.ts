import { DatabaseError } from "../../../../error/DatabaseError.ts";
import { User } from "../../models/User.ts";

// Chaque caractère compte (collation de la colonne) : Alex et alex sont deux comptes
export async function findUserByUsernameQuery(
	username: string,
): Promise<User | null> {
	try {
		return await User.findOne({ where: { username } });
	} catch (error) {
		throw new DatabaseError("Failed to fetch user by username", {
			cause: error,
		});
	}
}
