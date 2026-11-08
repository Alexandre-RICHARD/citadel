import { expect, type Page, test } from "@playwright/test";

import type { Identity } from "../helpers/identity/identity.type.ts";
import { backToCitadel } from "../helpers/navigation/backToCitadel.ts";
import { openRegistrationForm } from "./openRegistrationForm.ts";
import { registerAccount } from "./registerAccount.ts";

/**
 * Un compte neuf et connecté, pour les scénarios dont l'inscription n'est pas le sujet : part d'une page vierge (n'importe
 * laquelle), s'inscrit comme un visiteur, puis revient à la homepage, connecté. Renvoie l'identité du compte
 */
export async function createConnectedAccount(
	page: Page,
	label = "user",
): Promise<Identity> {
	await openRegistrationForm(page);
	const identity = await registerAccount(page, label);

	await test.step("Revenir à la homepage, connecté", async () => {
		await backToCitadel(page);
		await expect(
			page.getByRole("button", { name: "Se déconnecter" }),
		).toBeVisible();
	});

	return identity;
}
