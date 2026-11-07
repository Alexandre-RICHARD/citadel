import { expect, type Page, test } from "@playwright/test";

import { countMails } from "../helpers/mail/countMails.ts";
import { waitForMail } from "../helpers/mail/waitForMail.ts";

/**
 * Active le code par email depuis la page « Ton profil » déjà ouverte : le mail part à l'adresse du compte, son code est
 * tapé dans la page. Termine sur le profil. Si le compte n'avait aucune double authentification, les codes de secours
 * sont à sauvegarder avant : ce step n'est prévu que pour un compte qui en a déjà une
 */
export async function enableEmailFactor(
	page: Page,
	email: string,
): Promise<void> {
	await test.step("Activer le code par email", async () => {
		const mailsBefore = await countMails(email);
		await page
			.getByRole("button", { name: "Activer le code par email" })
			.click();
		await expect(
			page.getByRole("heading", { name: "Active le code par email" }),
		).toBeVisible();
		const mail = await waitForMail(email, { afterCount: mailsBefore });
		expect(mail.code, "le mail contient un code").not.toBeNull();
		await page
			.getByRole("textbox", { name: /Code reçu par email/ })
			.fill(mail.code!);
		await page.getByRole("button", { name: "Valider le code" }).click();
		await expect(
			page.getByRole("heading", { level: 1, name: "Ton profil" }),
		).toBeVisible();
	});
}
