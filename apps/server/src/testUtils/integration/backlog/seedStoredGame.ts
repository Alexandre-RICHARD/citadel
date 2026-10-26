import { insertBacklogRows } from "./insertBacklogRows.ts";
import { nextIgdbId } from "./nextIgdbId.ts";
import { SEEDED_PLATFORMS } from "./seededPlatforms.ts";

type SeedOptions = {
	name?: string;
	frenchName?: string | null;
	firstReleaseDate?: string | null;
	proposedSeriesId?: number | null;
	// Autres versions que l'originale, avec leur titre
	otherVersionTitles?: string[];
	// Plateformes de chaque version, originale comprise
	platformIds?: number[];
	dlcNames?: string[];
};

type SeededGame = {
	gameId: number;
	// L'originale d'abord
	versionIds: number[];
	dlcIds: number[];
};

// Un jeu en base, prêt à entrer dans le backlog : sa version originale (même id), d'autres versions et ses DLC
export async function seedStoredGame({
	name = "The Elder Scrolls V: Skyrim",
	frenchName = null,
	firstReleaseDate = "2011-11-11",
	proposedSeriesId = null,
	otherVersionTitles = [],
	platformIds = [SEEDED_PLATFORMS.PS3],
	dlcNames = [],
}: SeedOptions = {}): Promise<SeededGame> {
	const gameId = await nextIgdbId();
	await insertBacklogRows.game({
		id: gameId,
		name,
		frenchName,
		firstReleaseDate,
		proposedSeriesId,
	});

	const versionIds = [gameId];
	await insertBacklogRows.version({
		id: gameId,
		gameId,
		coverImageId: "co1abc",
	});
	for (const title of otherVersionTitles) {
		// eslint-disable-next-line no-await-in-loop -- chaque version prend l'id suivant
		const versionId = await nextIgdbId();
		// eslint-disable-next-line no-await-in-loop -- les insertions se suivent
		await insertBacklogRows.version({ id: versionId, gameId, title });
		versionIds.push(versionId);
	}
	for (const versionId of versionIds)
		for (const platformId of platformIds)
			// eslint-disable-next-line no-await-in-loop -- les insertions se suivent
			await insertBacklogRows.versionPlatform({
				versionId,
				platformId,
				releaseDate: firstReleaseDate,
			});

	const dlcIds: number[] = [];
	for (const dlcName of dlcNames) {
		// eslint-disable-next-line no-await-in-loop -- chaque DLC prend l'id suivant
		const dlcId = await nextIgdbId();
		// eslint-disable-next-line no-await-in-loop -- les insertions se suivent
		await insertBacklogRows.dlc({ id: dlcId, gameId, name: dlcName });
		dlcIds.push(dlcId);
	}
	return { gameId, versionIds, dlcIds };
}
