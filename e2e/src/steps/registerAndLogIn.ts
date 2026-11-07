import { type Page, test } from "@playwright/test";

import type { Identity } from "../helpers/identity/identity.type.ts";
import { logIn } from "./logIn.ts";
import { logOut } from "./logOut.ts";
import { registerAccount } from "./registerAccount.ts";

/**
 * Un compte prêt à l'emploi pour les scénarios qui commencent connectés (profil, 2FA…) : part du formulaire
 * « Créer un compte ». L'inscription laisse connecté dans le projet : on revient à la homepage, on se déconnecte
 * puis on se reconnecte par le formulaire de connexion, comme un utilisateur qui revient. Termine sur la homepage,
 * connecté. Renvoie l'identité du compte
 */
export async function registerAndLogIn(
	page: Page,
	label = "user",
): Promise<Identity> {
	const identity = await registerAccount(page, label);

	await test.step("Revenir sur le formulaire de connexion", async () => {
		await page.getByRole("button", { name: "Retour à la Citadel" }).click();
		await logOut(page);
		await page.getByRole("link", { name: "Se connecter" }).click();
	});

	await logIn(page, identity);
	return identity;
}
