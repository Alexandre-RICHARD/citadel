import { expect, type Page, test } from "@playwright/test";

import { openSite } from "../helpers/navigation/openSite.ts";

/**
 * Un visiteur (ou un navigateur sans session) ouvre le site puis « Se connecter » du header : termine sur le formulaire
 * de connexion
 */
export async function openLoginForm(page: Page): Promise<void> {
	await test.step("Ouvrir le site puis « Se connecter »", async () => {
		await openSite(page);
		await page.getByRole("link", { name: "Se connecter" }).click();
		await expect(
			page.getByRole("heading", { name: "Se connecter" }),
		).toBeVisible();
	});
}
