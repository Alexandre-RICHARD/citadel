import type { Transaction } from "sequelize";

import { DatabaseError } from "../../../../error/DatabaseError.ts";
import { UserMedia } from "../../models/UserMedia.ts";

type NewUserMedia = {
	movieId: number | null;
	tvShowId: number | null;
	imagePath: string | null;
};

// Lots raisonnables pour un import de plusieurs milliers de films
const ROWS_PER_INSERT = 500;

// Les médias d'un import entrent au backlog du compte, sans saga ni rien de coché (§7.2)
export async function createUserMediaListQuery(
	userId: number,
	rows: NewUserMedia[],
	transaction: Transaction,
): Promise<void> {
	try {
		for (let start = 0; start < rows.length; start += ROWS_PER_INSERT)
			// eslint-disable-next-line no-await-in-loop -- les lots d'une même transaction passent l'un après l'autre
			await UserMedia.bulkCreate(
				rows
					.slice(start, start + ROWS_PER_INSERT)
					.map((row) => ({ ...row, userId, sagaId: null, sagaNumber: null })),
				{ transaction },
			);
	} catch (error) {
		throw new DatabaseError("Failed to import media into the backlog", {
			cause: error,
		});
	}
}
