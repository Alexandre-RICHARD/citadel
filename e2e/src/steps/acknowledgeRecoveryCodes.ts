import { expect, type Page, test } from "@playwright/test";

import { readRecoveryCodes } from "../helpers/profile/readRecoveryCodes.ts";

/**
 * Part du panneau « Tes codes de secours » : lit les 10 codes, coche « J'ai sauvegardé mes codes de secours » puis
 * « Terminé ». Renvoie les codes (ils ne reviendront jamais)
 */
export async function acknowledgeRecoveryCodes(page: Page): Promise<string[]> {
	const codes = await readRecoveryCodes(page);
	expect(codes, "10 codes de secours").toHaveLength(10);

	await test.step("Confirmer avoir sauvegardé les codes de secours", async () => {
		await page.getByLabel(/J.ai sauvegardé mes codes de secours/).check();
		await page.getByRole("button", { name: "Terminé" }).click();
		await expect(
			page.getByRole("heading", { name: "Tes codes de secours" }),
		).toBeHidden();
	});

	return codes;
}
