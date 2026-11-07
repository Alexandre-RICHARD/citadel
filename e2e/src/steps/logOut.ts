import { expect, type Page, test } from "@playwright/test";

/**
 * Se déconnecter avec le bouton du header de la homepage (un projet ouvert se quitte avant par « Retour à la Citadel »).
 */
export async function logOut(page: Page): Promise<void> {
	await test.step("Se déconnecter : bouton du header", async () => {
		await page.getByRole("button", { name: "Se déconnecter" }).click();
		await expect(
			page.getByRole("link", { name: "Se connecter" }),
		).toBeVisible();
	});
}
