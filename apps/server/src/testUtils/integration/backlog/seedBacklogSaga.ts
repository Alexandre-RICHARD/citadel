import { insertMediaRows } from "./insertMediaRows.ts";
import { nextTmdbId } from "./nextTmdbId.ts";
import { seedBacklogShow } from "./seedBacklogShow.ts";

// Une saga du compte avec un film (n° 1) et une série (n° 2)
export async function seedBacklogSaga(userId: number): Promise<{
	sagaId: number;
	movieMediaId: number;
	showMediaId: number;
}> {
	const sagaId = await insertMediaRows.saga({ userId, name: "Star Wars" });
	const movieId = await nextTmdbId();
	await insertMediaRows.movie({
		id: movieId,
		title: "Un nouvel espoir",
		releaseDate: "1977-05-25",
	});
	const movieMediaId = await insertMediaRows.userMedia({
		userId,
		movieId,
		sagaId,
		sagaNumber: 1,
	});
	const show = await seedBacklogShow({
		name: "The Mandalorian",
		episodeCounts: [0, 1],
	});
	const showMediaId = await insertMediaRows.userMedia({
		userId,
		tvShowId: show.tvShowId,
		sagaId,
		sagaNumber: 2,
	});
	return { sagaId, movieMediaId, showMediaId };
}
