import { expect, type Page, test } from "@playwright/test";

/**
 * Part du formulaire « Se connecter » : « Mot de passe oublié ? », saisit l'identifiant et demande l'email. Termine sur
 * l'écran « Vérifie tes emails » (la réponse est la même que le compte existe ou non)
 */
export async function startPasswordReset(
	page: Page,
	identifier: string,
): Promise<void> {
	await test.step("Mot de passe oublié : demander l'email", async () => {
		await page.getByRole("link", { name: "Mot de passe oublié ?" }).click();
		await page
			.getByRole("textbox", { name: "Adresse email ou pseudo" })
			.fill(identifier);
		await page.getByRole("button", { name: /Recevoir l.email/ }).click();
		await expect(
			page.getByRole("heading", { name: "Vérifie tes emails" }),
		).toBeVisible();
	});
}
