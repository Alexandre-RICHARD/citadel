import { type Page, test } from "@playwright/test";

/**
 * Remplit le formulaire « Se connecter » déjà affiché (email ou pseudo, mot de passe) et l'envoie, sans rien attendre
 * ensuite : le résultat (session, second facteur, refus) dépend du scénario. `remember` coche « Se souvenir de moi »
 */
export async function fillLoginForm(
	page: Page,
	{
		identifier,
		password,
		remember = false,
	}: { identifier: string; password: string; remember?: boolean },
): Promise<void> {
	await test.step("Se connecter : remplir le formulaire et l'envoyer", async () => {
		await page
			.getByRole("textbox", { name: "Adresse email ou pseudo" })
			.fill(identifier);
		await page.getByRole("textbox", { name: "Mot de passe" }).fill(password);
		if (remember) await page.getByLabel("Se souvenir de moi").check();
		await page.getByRole("button", { name: "Se connecter" }).click();
	});
}
