import { expect, type Page, test } from "@playwright/test";

import { openSite } from "../helpers/navigation/openSite.ts";

/** Un visiteur ouvre le site puis « Contact » du pied de page : termine sur le formulaire de contact */
export async function openContactForm(page: Page): Promise<void> {
	await test.step("Ouvrir le site puis « Contact » du pied de page", async () => {
		await openSite(page);
		await page
			.getByRole("navigation", { name: "Liens du site" })
			.getByRole("link", { name: "Contact" })
			.click();
		await expect(
			page.getByRole("heading", { level: 1, name: "Contact" }),
		).toBeVisible();
	});
}
