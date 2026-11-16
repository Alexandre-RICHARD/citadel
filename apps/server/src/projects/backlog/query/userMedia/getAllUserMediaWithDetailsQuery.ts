import { DatabaseError } from "../../../../error/DatabaseError.ts";
import { Movie } from "../../models/Movie.ts";
import { Saga } from "../../models/Saga.ts";
import { TvShow } from "../../models/TvShow.ts";
import { UserMedia } from "../../models/UserMedia.ts";

// Tout le backlog des films et séries du compte, chaque média avec son film ou sa série et sa saga
export async function getAllUserMediaWithDetailsQuery(
	userId: number,
): Promise<UserMedia[]> {
	try {
		return await UserMedia.findAll({
			where: { userId },
			include: [
				{ model: Movie, as: "movie" },
				{ model: TvShow, as: "tvShow" },
				{ model: Saga, as: "saga" },
			],
		});
	} catch (error) {
		throw new DatabaseError("Failed to fetch backlog media", { cause: error });
	}
}
