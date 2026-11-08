import { expect, type Page } from "@playwright/test";

import { ApiPathEnum } from "./apiPath.enum.ts";
import { callApi } from "./callApi.ts";

type GdcData = { gameId: number; bossId: number; deathId: number };

type CreatedItem = { id: number };

/**
 * Crée par l'API, avec la session du navigateur de `page`, un jeu Game Death Counter avec un boss et une mort (comme si
 * l'utilisateur les avait saisis : le scénario ne teste pas leur création). Renvoie leurs identifiants
 */
export async function createGdcData(
	page: Page,
	{ gameName, bossName }: { gameName: string; bossName: string },
): Promise<GdcData> {
	const game = await callApi(page, {
		method: "POST",
		path: ApiPathEnum.GDC_GAMES,
		body: { name: gameName },
	});
	expect(game.status, "création du jeu").toBe(201);
	const gameId = (game.data as CreatedItem).id;

	const boss = await callApi(page, {
		method: "POST",
		path: `${ApiPathEnum.GDC_GAMES}/${gameId}/bosses`,
		body: { name: bossName },
	});
	expect(boss.status, "création du boss").toBe(201);
	const bossId = (boss.data as CreatedItem).id;

	const death = await callApi(page, {
		method: "POST",
		path: `${ApiPathEnum.GDC_BOSSES}/${bossId}/deaths`,
	});
	expect(death.status, "ajout de la mort").toBe(201);
	const deathId = (death.data as CreatedItem).id;

	return { gameId, bossId, deathId };
}
