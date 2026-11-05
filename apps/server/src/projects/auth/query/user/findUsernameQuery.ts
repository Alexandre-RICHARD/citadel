import type { Transaction } from "sequelize";

import { DatabaseError } from "../../../../error/DatabaseError.ts";
import { User } from "../../models/User.ts";

// Le pseudo du compte, définitif et unique ; null : le compte n'existe plus
export async function findUsernameQuery(
	userId: number,
	transaction: Transaction,
): Promise<string | null> {
	try {
		const user = await User.findByPk(userId, {
			attributes: ["username"],
			transaction,
		});
		return user?.username ?? null;
	} catch (error) {
		throw new DatabaseError("Failed to fetch username", { cause: error });
	}
}
