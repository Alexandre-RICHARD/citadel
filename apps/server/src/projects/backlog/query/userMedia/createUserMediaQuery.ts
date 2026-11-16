import type { Transaction } from "sequelize";

import { DatabaseError } from "../../../../error/DatabaseError.ts";
import { UserMedia } from "../../models/UserMedia.ts";

type NewUserMedia = {
	userId: number;
	movieId: number | null;
	tvShowId: number | null;
	imagePath: string | null;
};

// Un média entre au backlog du compte, sans saga : la personnalisation suit, dans la même transaction
export async function createUserMediaQuery(
	userMedia: NewUserMedia,
	transaction: Transaction,
): Promise<number> {
	try {
		const created = await UserMedia.create(
			{ ...userMedia, sagaId: null, sagaNumber: null },
			{ transaction },
		);
		return created.id;
	} catch (error) {
		throw new DatabaseError("Failed to add media to the backlog", {
			cause: error,
		});
	}
}
