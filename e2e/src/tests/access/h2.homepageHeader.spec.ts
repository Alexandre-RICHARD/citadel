import { expect, test } from "@playwright/test";

import { ApiPathEnum } from "../../helpers/api/apiPath.enum.ts";
import { openSite } from "../../helpers/navigation/openSite.ts";
import { createConnectedAccount } from "../../steps/createConnectedAccount.ts";
import { logOut } from "../../steps/logOut.ts";

// Assez long pour constater que le header ne montre rien en attendant, assez court pour ne pas ralentir le test
const SLOW_ME_DELAY_MS = 2_500;
const PHONE_VIEWPORT = { width: 390, height: 844 };
const SAME_LINE_TOLERANCE_PX = 8;

test.describe("Accès aux projets", () => {
	test("H2 : le header de la homepage montre « Se connecter » ou le compte, rien en attendant la réponse du serveur, et reste sur une ligne sur téléphone", async ({
		page,
	}) => {
		const identity = await createConnectedAccount(page, "rachel");
		const profileLink = page.getByRole("link", { name: /^Mon profil/ });
		const logoutButton = page.getByRole("button", { name: "Se déconnecter" });
		const loginLink = page.getByRole("link", { name: "Se connecter" });

		await test.step("Connecté : le pseudo affiché mène au profil, « Se déconnecter » est là", async () => {
			await expect(profileLink).toContainText(identity.username);
			await expect(logoutButton).toBeVisible();
			await expect(loginLink).toHaveCount(0);
		});

		await test.step("Tant que le serveur n'a pas répondu, le header ne montre ni « Se connecter » ni le compte", async () => {
			await page.route(`**${ApiPathEnum.AUTH_ME}`, async (route) => {
				await new Promise((resolve) => setTimeout(resolve, SLOW_ME_DELAY_MS));
				await route.continue();
			});
			await page.reload();
			await expect(
				page.getByRole("navigation", { name: "Projets" }),
			).toBeVisible();
			await expect(loginLink).toHaveCount(0);
			await expect(profileLink).toHaveCount(0);
			await expect(logoutButton).toHaveCount(0);
			// La réponse arrive : le compte apparaît, jamais « Se connecter » entre-temps
			await expect(profileLink).toBeVisible();
			await expect(loginLink).toHaveCount(0);
			await page.unroute(`**${ApiPathEnum.AUTH_ME}`);
		});

		await test.step("Sur téléphone : le profil et la déconnexion sont des icônes, sur la même ligne", async () => {
			await page.setViewportSize(PHONE_VIEWPORT);
			await expect(profileLink).toBeVisible();
			await expect(logoutButton).toBeVisible();
			// Le libellé et le pseudo disparaissent, le nom accessible reste
			await expect(
				page.getByText(identity.username, { exact: true }),
			).toBeHidden();
			const profileBox = await profileLink.boundingBox();
			const logoutBox = await logoutButton.boundingBox();
			expect(
				Math.abs(
					(profileBox?.y ?? 0) +
						(profileBox?.height ?? 0) / 2 -
						((logoutBox?.y ?? 0) + (logoutBox?.height ?? 0) / 2),
				),
				"profil et déconnexion alignés",
			).toBeLessThan(SAME_LINE_TOLERANCE_PX);
			await page.setViewportSize({ width: 1280, height: 720 });
		});

		await logOut(page);

		await test.step("Déconnecté : « Se connecter » remplace le compte, aussi après rechargement", async () => {
			await page.reload();
			await openSite(page);
			await expect(loginLink).toBeVisible();
			await expect(profileLink).toHaveCount(0);
			await expect(logoutButton).toHaveCount(0);
		});
	});
});
