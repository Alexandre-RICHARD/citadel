import { insertBacklogRows } from "../backlog/insertBacklogRows.ts";
import { seedBacklogGame } from "../backlog/seedBacklogGame.ts";
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
};

/**
 * Une ligne dans chaque table des projets pour ce compte. Son jeu du Backlog est rangé dans une série qu'il a créée : le
 * cas où l'ordre des suppressions compte (le jeu tient sa série en RESTRICT)
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

	return {
		gdc: { gameId, bossId, deathId },
		backlog: { gameId: backlogGame.gameId, userVersionId, dlcId, seriesId },
	};
}
