import { expect, test } from "@playwright/test";

import { E2EUrlEnum } from "../../dictionaries/e2eUrl.enum.ts";
import { ApiPathEnum } from "../../helpers/api/apiPath.enum.ts";
import { callApi } from "../../helpers/api/callApi.ts";
import { createGdcData } from "../../helpers/api/createGdcData.ts";
import { backToCitadel } from "../../helpers/navigation/backToCitadel.ts";
import { openInNewTab } from "../../helpers/navigation/openInNewTab.ts";
import { openProjectFromHomepage } from "../../helpers/navigation/openProjectFromHomepage.ts";
import { createConnectedAccount } from "../../steps/createConnectedAccount.ts";
import { signInOnOtherBrowser } from "../../steps/signInOnOtherBrowser.ts";

// Plus que le temps d'un clic sur « Se déconnecter » : la mort ajoutée reste « en cours d'envoi » le temps du scénario
const SLOW_API_DELAY_MS = 5_000;

test.describe("Déconnexion", () => {
	test("G6 : se déconnecter d'un clic, sans toucher les autres navigateurs ; les autres onglets retombent sur la connexion ; avertissement seulement avec un envoi en cours", async ({
		page,
		browser,
	}) => {
		const identity = await createConnectedAccount(page, "oscar");
		const other = await signInOnOtherBrowser(browser, identity);

		// Un second onglet du même navigateur, ouvert sur le profil avant la déconnexion
		const secondTab = await openInNewTab(page, E2EUrlEnum.AUTH_PROFILE);
		await expect(
			secondTab.getByRole("heading", { level: 1, name: "Votre profil" }),
		).toBeVisible();

		// Un jeu GDC avec un boss, créé par l'API : le scénario ne teste pas sa création
		const gameName = `Jeu de ${identity.username}`;
		await createGdcData(page, { gameName, bossName: "Le gardien" });

		const deathSent = page.waitForResponse(
			(response) =>
				response.url().includes("/deaths") &&
				response.request().method() === "POST",
		);

		await test.step("Avec un envoi en cours, « Se déconnecter » avertit ; « Annuler » garde la session", async () => {
			await openProjectFromHomepage(page, "Game Death Counter");
			await page.getByRole("button", { name: gameName }).click();
			await page.route(
				"**/api/game-death-counter/bosses/*/deaths",
				async (route) => {
					await new Promise((resolve) =>
						setTimeout(resolve, SLOW_API_DELAY_MS),
					);
					await route.continue();
				},
			);
			await page
				.getByRole("button", { name: "Ajouter une mort (+1)" })
				.first()
				.click();
			await backToCitadel(page);

			await page.getByRole("button", { name: "Se déconnecter" }).click();
			const dialog = page.getByRole("alertdialog", {
				name: "Se déconnecter maintenant ?",
			});
			await expect(dialog).toBeVisible();
			await dialog.getByRole("button", { name: "Annuler" }).click();
			await expect(dialog).toBeHidden();
			await expect(
				page.getByRole("button", { name: "Se déconnecter" }),
			).toBeVisible();
		});

		await test.step("Sans envoi en cours, un clic suffit : pas de confirmation", async () => {
			// L'envoi en cours (retardé) finit avant de continuer
			await deathSent;
			await page.unroute("**/api/game-death-counter/bosses/*/deaths");
			await page.getByRole("button", { name: "Se déconnecter" }).click();
			await expect(
				page.getByRole("link", { name: "Se connecter" }),
			).toBeVisible();
			await expect(page.getByRole("alertdialog")).toHaveCount(0);
		});

		await test.step("Une seconde déconnexion, sans session, ne provoque aucune erreur", async () => {
			const again = await callApi(page, {
				method: "POST",
				path: ApiPathEnum.AUTH_LOGOUT,
			});
			expect(again.status, "seconde déconnexion").toBeLessThan(300);
		});

		await test.step("L'autre onglet retombe sur la connexion et n'affiche plus rien du compte", async () => {
			await secondTab.reload();
			await expect(secondTab).toHaveURL(new RegExp(`${E2EUrlEnum.AUTH_LOGIN}`));
			await expect(secondTab.getByText(identity.username)).toHaveCount(0);
			await expect(secondTab.getByText(identity.email)).toHaveCount(0);
		});

		await test.step("Un autre navigateur connecté au même compte reste connecté", async () => {
			await other.page.reload();
			await expect(
				other.page.getByRole("button", { name: "Se déconnecter" }),
			).toBeVisible();
		});
	});
});
