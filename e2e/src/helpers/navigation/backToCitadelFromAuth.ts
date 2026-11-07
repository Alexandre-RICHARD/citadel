import { expect, type Page } from "@playwright/test";

/** Quitte une page du compte (profil, connexion…) par le nom du site en haut à gauche et attend la homepage */
export async function backToCitadelFromAuth(page: Page): Promise<void> {
	await page.getByRole("link", { name: /La Citadel d.Alex/ }).click();
	await expect(page.getByRole("navigation", { name: "Projets" })).toBeVisible();
}
