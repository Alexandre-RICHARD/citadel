import { DatabaseError } from "../../../../error/DatabaseError.ts";
import { User } from "../../models/User.ts";

export async function findUserByIdQuery(id: number): Promise<User | null> {
	try {
		return await User.findByPk(id);
	} catch (error) {
		throw new DatabaseError("Failed to fetch user", { cause: error });
	}
}
