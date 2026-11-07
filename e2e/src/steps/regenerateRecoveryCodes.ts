import { expect, type Page, test } from "@playwright/test";

import { acknowledgeRecoveryCodes } from "./acknowledgeRecoveryCodes.ts";

/**
 * Depuis la page « Ton profil » : « Refaire mes codes de secours » avec le mot de passe, puis sauvegarde du nouveau lot.
 * Renvoie les 10 nouveaux codes (les anciens ne marchent plus)
 */
export async function regenerateRecoveryCodes(
	page: Page,
	password: string,
): Promise<string[]> {
	return test.step("Refaire les codes de secours", async () => {
		await page
			.getByRole("button", { name: "Refaire mes codes de secours" })
			.click();
		await expect(
			page.getByText(/Les anciens codes, utilisés ou non, ne marcheront plus/),
		).toBeVisible();
		await page
			.getByRole("textbox", { name: "Ton mot de passe" })
			.fill(password);
		await page
			.getByRole("button", { name: "Refaire mes codes", exact: true })
			.click();
		await expect(
			page.getByRole("heading", { name: "Tes codes de secours" }),
		).toBeVisible();
		return acknowledgeRecoveryCodes(page);
	});
}
