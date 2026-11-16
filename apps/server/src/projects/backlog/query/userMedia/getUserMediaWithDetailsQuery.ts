import type { Transaction } from "sequelize";

import { DatabaseError } from "../../../../error/DatabaseError.ts";
import { Movie } from "../../models/Movie.ts";
import { Saga } from "../../models/Saga.ts";
import { TvShow } from "../../models/TvShow.ts";
import { UserMedia } from "../../models/UserMedia.ts";

// Un média du backlog du compte, avec son film ou sa série et sa saga
export async function getUserMediaWithDetailsQuery(
	userId: number,
	userMediaId: number,
	transaction: Transaction | null = null,
): Promise<UserMedia | null> {
	try {
		return await UserMedia.findOne({
			where: { id: userMediaId, userId },
			include: [
				{ model: Movie, as: "movie" },
				{ model: TvShow, as: "tvShow" },
				{ model: Saga, as: "saga" },
			],
			transaction,
		});
	} catch (error) {
		throw new DatabaseError("Failed to fetch backlog media", { cause: error });
	}
}
