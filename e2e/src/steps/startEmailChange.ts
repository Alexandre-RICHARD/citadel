import { expect, type Page, test } from "@playwright/test";

/**
 * Depuis la page « Votre profil » : ouvre « Changer mon adresse email », saisit la nouvelle adresse et le mot de passe,
 * et envoie. Termine sur « Confirmez votre nouvelle adresse email » (la réponse est la même que l'adresse soit libre ou prise)
 */
export async function startEmailChange(
	page: Page,
	{ newEmail, password }: { newEmail: string; password: string },
): Promise<void> {
	await test.step(`Demander le changement d'adresse vers ${newEmail}`, async () => {
		await page
			.getByRole("button", { name: "Changer mon adresse email" })
			.click();
		await page
			.getByRole("textbox", { name: "Nouvelle adresse email" })
			.fill(newEmail);
		await page
			.getByRole("textbox", { name: "Votre mot de passe" })
			.fill(password);
		await page
			.getByRole("button", { name: /Recevoir l.email de confirmation/ })
			.click();
		await expect(
			page.getByRole("heading", {
				name: "Confirmez votre nouvelle adresse email",
			}),
		).toBeVisible();
	});
}
