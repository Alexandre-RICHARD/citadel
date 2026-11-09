import { expect, type Page } from "@playwright/test";

/**
 * Ouvre « Mon profil » par l'icône du compte (header de la homepage, barre du Backlog ou de GDC) et attend la page
 */
export async function openProfile(page: Page): Promise<void> {
	await page.getByRole("link", { name: /^Mon profil/ }).click();
	await expect(
		page.getByRole("heading", { level: 1, name: "Ton profil" }),
	).toBeVisible();
}
