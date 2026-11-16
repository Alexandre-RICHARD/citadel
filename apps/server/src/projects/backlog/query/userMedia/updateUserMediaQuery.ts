import type { Transaction } from "sequelize";

import { DatabaseError } from "../../../../error/DatabaseError.ts";
import { UserMedia } from "../../models/UserMedia.ts";

type UserMediaFields = {
	imagePath?: string | null;
	sagaId?: number | null;
	sagaNumber?: number | null;
	isWatched?: boolean;
	isUpNext?: boolean;
	isInProgress?: boolean;
	comment?: string | null;
};

// Les champs donnés d'un média du backlog du compte ; les autres ne changent pas
export async function updateUserMediaQuery(
	userId: number,
	userMediaId: number,
	fields: UserMediaFields,
	transaction: Transaction,
): Promise<void> {
	try {
		await UserMedia.update(fields, {
			where: { id: userMediaId, userId },
			transaction,
		});
	} catch (error) {
		throw new DatabaseError("Failed to update backlog media", { cause: error });
	}
}
