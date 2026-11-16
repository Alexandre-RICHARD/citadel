import { MediaTypeEnum } from "@citadel/specs/src/projects/backlog/enum/mediaType.enum.ts";
import { Op, type Transaction } from "sequelize";

import { DatabaseError } from "../../../../error/DatabaseError.ts";
import { UserMedia } from "../../models/UserMedia.ts";

// Parmi ces films ou ces séries, ceux du backlog du compte : identifiant TMDB → ligne du backlog
export async function findUserMediaIdsByTmdbQuery(
	userId: number,
	mediaType: MediaTypeEnum,
	tmdbIds: number[],
	transaction: Transaction | null = null,
): Promise<Map<number, number>> {
	if (tmdbIds.length === 0) return new Map();
	const column = mediaType === MediaTypeEnum.MOVIE ? "movieId" : "tvShowId";
	try {
		const rows = await UserMedia.findAll({
			attributes: ["id", column],
			where: { userId, [column]: { [Op.in]: tmdbIds } },
			transaction,
		});
		return new Map(
			rows.flatMap((row) => {
				const tmdbId = row[column];
				return tmdbId === null ? [] : [[tmdbId, row.id] as const];
			}),
		);
	} catch (error) {
		throw new DatabaseError("Failed to fetch backlog media", { cause: error });
	}
}
