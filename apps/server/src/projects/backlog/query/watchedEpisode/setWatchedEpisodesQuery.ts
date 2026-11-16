import { Op, type Transaction } from "sequelize";

import { DatabaseError } from "../../../../error/DatabaseError.ts";
import { WatchedEpisode } from "../../models/WatchedEpisode.ts";

// Coche ou décoche ces épisodes pour le compte ; un épisode déjà dans l'état voulu ne change pas
export async function setWatchedEpisodesQuery(
	userId: number,
	episodeIds: number[],
	isWatched: boolean,
	transaction: Transaction,
): Promise<void> {
	try {
		if (isWatched)
			await WatchedEpisode.bulkCreate(
				episodeIds.map((tvEpisodeId) => ({ userId, tvEpisodeId })),
				{ ignoreDuplicates: true, transaction },
			);
		else
			await WatchedEpisode.destroy({
				where: { userId, tvEpisodeId: { [Op.in]: episodeIds } },
				transaction,
			});
	} catch (error) {
		throw new DatabaseError("Failed to save watched episodes", {
			cause: error,
		});
	}
}
