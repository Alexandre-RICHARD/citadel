import type { Page } from "@playwright/test";

/**
 * L'utilisateur revient sur un onglet resté en arrière-plan : le navigateur le passe devant et prévient la page
 * (`visibilitychange`, d'où le site relit son parcours). Un navigateur sans fenêtre ne prévient jamais : on l'envoie
 */
export async function returnToTab(page: Page): Promise<void> {
	await page.bringToFront();
	await page.evaluate(() => {
		document.dispatchEvent(new Event("visibilitychange"));
	});
}
