import { expect, type Page, test } from "@playwright/test";

import type { Identity } from "../helpers/identity/identity.type.ts";

/**
 * Remplit le formulaire d'inscription déjà affiché avec l'identité donnée, l'envoie et attend l'écran « Confirme ton
 * adresse email ». `remember` coche « Se souvenir de moi »
 */
export async function fillRegistrationForm(
	page: Page,
	identity: Identity,
	{ remember = false }: { remember?: boolean } = {},
): Promise<void> {
	await test.step("Remplir le formulaire d'inscription et l'envoyer", async () => {
		await page
			.getByRole("textbox", { name: "Adresse email" })
			.fill(identity.email);
		await page.getByRole("textbox", { name: "Pseudo" }).fill(identity.username);
		await page
			.getByRole("textbox", { name: "Mot de passe", exact: true })
			.fill(identity.password);
		await page
			.getByRole("textbox", { name: "Confirmation du mot de passe" })
			.fill(identity.password);
		if (remember) await page.getByLabel("Se souvenir de moi").check();
		await page.getByRole("button", { name: "Créer mon compte" }).click();
		await expect(
			page.getByRole("heading", { name: "Confirme ton adresse email" }),
		).toBeVisible();
	});
}
