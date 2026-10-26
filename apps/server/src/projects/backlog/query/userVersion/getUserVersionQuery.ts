import type { Transaction } from "sequelize";

import { DatabaseError } from "../../../../error/DatabaseError.ts";
import { UserVersion } from "../../models/UserVersion.ts";
import { Version } from "../../models/Version.ts";

type UserVersionWithVersion = UserVersion & { version: Version };

// Avec sa version, qui donne son jeu ; verrouillée jusqu'à la fin de la transaction
export async function getUserVersionQuery(
	id: number,
	transaction: Transaction,
): Promise<UserVersionWithVersion | null> {
	try {
		const userVersion = await UserVersion.findByPk(id, {
			include: [{ model: Version, as: "version" }],
			transaction,
			lock: transaction.LOCK.UPDATE,
		});
		// Obligé de caster : l'include ci-dessus garantit `version`, que Sequelize ne sait pas typer
		return userVersion as UserVersionWithVersion | null;
	} catch (error) {
		throw new DatabaseError("Failed to fetch played version", {
			cause: error,
		});
	}
}
