import { insertBacklogRows } from "../backlog/insertBacklogRows.ts";
import { insertMediaRows } from "../backlog/insertMediaRows.ts";
import { nextTmdbId } from "../backlog/nextTmdbId.ts";
import { seedBacklogGame } from "../backlog/seedBacklogGame.ts";
import { seedBacklogShow } from "../backlog/seedBacklogShow.ts";
import { insertBossRow } from "../gameDeathCounter/insertBossRow.ts";
import { insertDeathRow } from "../gameDeathCounter/insertDeathRow.ts";
import { insertGameRow } from "../gameDeathCounter/insertGameRow.ts";

type AccountProjectData = {
	gdc: { gameId: number; bossId: number; deathId: number };
	backlog: {
		gameId: number;
		userVersionId: number;
		dlcId: number;
		seriesId: number;
	};
	media: {
		movieId: number;
		movieUserMediaId: number;
		sagaId: number;
		collectionId: number;
		episodeId: number;
	};
};

/**
 * Une ligne dans chaque table des projets pour ce compte. Son jeu du Backlog est rangé dans une série qu'il a créée, et
 * son film dans une saga : les cas où l'ordre des suppressions compte (jeu et film tiennent leur série ou leur saga en
 * RESTRICT). Sa série a un épisode vu
 */
export async function seedAccountProjectData(
	userId: number,
): Promise<AccountProjectData> {
	const gameId = await insertGameRow({ userId, name: "Hollow Knight" });
	const bossId = await insertBossRow({ gameId, name: "Hornet", totalDeath: 1 });
	const deathId = await insertDeathRow({
		bossId,
		date: new Date("2017-02-24T20:00:00.000Z"),
	});

	const seriesId = await insertBacklogRows.series({ userId, name: "Mes jeux" });
	const backlogGame = await seedBacklogGame({
		userId,
		seriesId,
		seriesNumber: 1,
		dlcNames: ["Dawnguard"],
	});
	const [userVersionId = 0] = backlogGame.userVersionIds;
	const [dlcId = 0] = backlogGame.dlcIds;
	await insertBacklogRows.doneDlc({ userVersionId, dlcId });

	const collectionId = await nextTmdbId();
	await insertMediaRows.collection({ id: collectionId, name: "Dune" });
	const movieId = await nextTmdbId();
	await insertMediaRows.movie({ id: movieId, title: "Dune", collectionId });
	const sagaId = await insertMediaRows.saga({ userId, name: "Mes sagas" });
	await insertMediaRows.sagaCollection({ userId, collectionId, sagaId });
	const movieUserMediaId = await insertMediaRows.userMedia({
		userId,
		movieId,
		sagaId,
		sagaNumber: 1,
	});
	const show = await seedBacklogShow({ episodeCounts: [0, 1] });
	await insertMediaRows.userMedia({ userId, tvShowId: show.tvShowId });
	const [, [episodeId = 0] = []] = show.episodeIds;
	await insertMediaRows.watchedEpisode({ userId, tvEpisodeId: episodeId });

	return {
		gdc: { gameId, bossId, deathId },
		backlog: { gameId: backlogGame.gameId, userVersionId, dlcId, seriesId },
		media: { movieId, movieUserMediaId, sagaId, collectionId, episodeId },
	};
}
