/* eslint-disable no-await-in-loop -- les étapes d'un scénario s'enchaînent dans l'ordre : chaque tour attend le précédent */
import { expect, test } from "@playwright/test";

import { ApiPathEnum } from "../../helpers/api/apiPath.enum.ts";
import { callApi } from "../../helpers/api/callApi.ts";
import { createGdcData } from "../../helpers/api/createGdcData.ts";
import { openOtherBrowser } from "../../helpers/browser/openOtherBrowser.ts";
import { openProjectFromHomepage } from "../../helpers/navigation/openProjectFromHomepage.ts";
import { createConnectedAccount } from "../../steps/createConnectedAccount.ts";

test.describe("Isolation entre comptes", () => {
	test("I2 : le jeu, le boss et la mort d'un compte sont introuvables (404) pour un autre, qui n'en voit rien et n'y touche pas", async ({
		page,
		browser,
	}) => {
		await createConnectedAccount(page, "sam");
		const owned = await createGdcData(page, {
			gameName: "Le jeu de Sam",
			bossName: "Le boss de Sam",
		});

		const strangerBrowser = await openOtherBrowser(browser);
		const strangerPage = await strangerBrowser.newPage();
		await createConnectedAccount(strangerPage, "tina");

		await test.step("Les identifiants de Sam, tapés dans l'API par Tina : tous introuvables", async () => {
			const attempts = [
				{ method: "GET", path: `${ApiPathEnum.GDC_GAMES}/${owned.gameId}` },
				{
					method: "PUT",
					path: `${ApiPathEnum.GDC_GAMES}/${owned.gameId}`,
					body: { name: "Volé" },
				},
				{
					method: "PATCH",
					path: `${ApiPathEnum.GDC_GAMES}/${owned.gameId}/finished`,
					body: { finished: true },
				},
				{
					method: "POST",
					path: `${ApiPathEnum.GDC_GAMES}/${owned.gameId}/bosses`,
					body: { name: "Intrus" },
				},
				{ method: "GET", path: `${ApiPathEnum.GDC_BOSSES}/${owned.bossId}` },
				{
					method: "PUT",
					path: `${ApiPathEnum.GDC_BOSSES}/${owned.bossId}`,
					body: { name: "Volé", gameId: owned.gameId },
				},
				{
					method: "PATCH",
					path: `${ApiPathEnum.GDC_BOSSES}/${owned.bossId}/defeated`,
					body: { defeated: true },
				},
				{
					method: "POST",
					path: `${ApiPathEnum.GDC_BOSSES}/${owned.bossId}/deaths`,
				},
				{
					method: "PATCH",
					path: `${ApiPathEnum.GDC_DEATHS}/${owned.deathId}`,
					body: { comment: "Volé" },
				},
				{
					method: "DELETE",
					path: `${ApiPathEnum.GDC_DEATHS}/${owned.deathId}`,
				},
				{ method: "DELETE", path: `${ApiPathEnum.GDC_BOSSES}/${owned.bossId}` },
				{ method: "DELETE", path: `${ApiPathEnum.GDC_GAMES}/${owned.gameId}` },
			] as const;
			for (const { method, path, ...rest } of attempts) {
				const answer = await callApi(strangerPage, {
					method,
					path,
					...("body" in rest && { body: rest.body }),
				});
				expect.soft(answer.status, `${method} ${path}`).toBe(404);
			}
		});

		await test.step("Tina ne peut pas non plus ranger son propre boss dans le jeu de Sam", async () => {
			const mine = await createGdcData(strangerPage, {
				gameName: "Le jeu de Tina",
				bossName: "Le boss de Tina",
			});
			const answer = await callApi(strangerPage, {
				method: "PUT",
				path: `${ApiPathEnum.GDC_BOSSES}/${mine.bossId}`,
				body: { name: "Le boss de Tina", gameId: owned.gameId },
			});
			expect(answer.status, "déplacer son boss vers le jeu d'un autre").toBe(
				404,
			);
		});

		await test.step("La liste de Tina ne montre rien de Sam", async () => {
			const answer = await callApi(strangerPage, {
				method: "GET",
				path: ApiPathEnum.GDC_GAMES,
			});
			expect(JSON.stringify(answer.data ?? "")).not.toContain("Le jeu de Sam");
		});

		await test.step("À l'écran, Tina ne voit que son jeu", async () => {
			await openProjectFromHomepage(strangerPage, "Game Death Counter");
			await expect(
				strangerPage.getByText("Le jeu de Tina").first(),
			).toBeVisible();
			await expect(strangerPage.getByText("Le jeu de Sam")).toHaveCount(0);
		});

		await test.step("Les données de Sam sont intactes : rien n'a été modifié ni supprimé", async () => {
			await openProjectFromHomepage(page, "Game Death Counter");
			await expect(page.getByText("Le jeu de Sam").first()).toBeVisible();
			const game = await callApi(page, {
				method: "GET",
				path: `${ApiPathEnum.GDC_GAMES}/${owned.gameId}`,
			});
			expect(game.status).toBe(200);
			expect(JSON.stringify(game.data)).not.toContain("Volé");
			expect(JSON.stringify(game.data)).toContain("Le boss de Sam");
		});
	});
});
