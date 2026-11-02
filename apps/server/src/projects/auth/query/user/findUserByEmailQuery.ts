import { DatabaseError } from "../../../../error/DatabaseError.ts";
import { User } from "../../models/User.ts";

// Sans distinction de casse (collation de la colonne) : Alex@ et alex@ sont la même adresse
export async function findUserByEmailQuery(
	email: string,
): Promise<User | null> {
	try {
		return await User.findOne({ where: { email } });
	} catch (error) {
		throw new DatabaseError("Failed to fetch user by email", {
			cause: error,
		});
	}
}
