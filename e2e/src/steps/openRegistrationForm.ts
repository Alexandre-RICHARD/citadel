import { expect, type Page, test } from "@playwright/test";

import { openProjectFromHomepage } from "../helpers/navigation/openProjectFromHomepage.ts";
import { openSite } from "../helpers/navigation/openSite.ts";

/**
 * Le chemin d'un visiteur jusqu'au formulaire d'inscription : le site, « Y accéder » du Backlog (renvoyé à la
 * connexion, projet privé), puis « Créer un compte ». Part d'une page vierge, termine sur le formulaire
 */
export async function openRegistrationForm(page: Page): Promise<void> {
	await test.step("Ouvrir le site : la homepage s'affiche", async () => {
		await openSite(page);
	});

	await test.step("« Y accéder » du Backlog : renvoyé à la connexion", async () => {
		await openProjectFromHomepage(page, "Backlog");
		await expect(
			page.getByRole("heading", { name: "Se connecter" }),
		).toBeVisible();
	});

	await test.step("« Créer un compte » : le formulaire d'inscription s'ouvre", async () => {
		await page.getByRole("link", { name: "Créer un compte" }).click();
		await expect(
			page.getByRole("heading", { name: "Créer un compte" }),
		).toBeVisible();
	});
}
