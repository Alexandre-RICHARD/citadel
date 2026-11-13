import { expect, type Page, test } from "@playwright/test";

import { createIdentity } from "../helpers/identity/createIdentity.ts";
import type { Identity } from "../helpers/identity/identity.type.ts";
import { waitForMailWithSubject } from "../helpers/mail/waitForMailWithSubject.ts";
import { fillRegistrationForm } from "./fillRegistrationForm.ts";

/**
 * S'inscrire en tapant le code du mail dans l'onglet resté ouvert (sans le lien) : part du formulaire « Créer un
 * compte » déjà affiché et termine, dans le même onglet, sur l'étape « Protégez votre compte ». `identity` : l'identité à
 * inscrire (une neuve, `label` en préfixe, par défaut). Renvoie l'identité créée
 */
export async function registerWithCode(
	page: Page,
	{
		label = "user",
		identity = createIdentity(label),
	}: { label?: string; identity?: Identity } = {},
): Promise<Identity> {
	await fillRegistrationForm(page, identity);

	await test.step("S'inscrire : taper le code du mail", async () => {
		const mail = await waitForMailWithSubject(
			identity.email,
			"Confirme ton inscription",
		);
		expect(mail.code, "le mail contient un code").not.toBeNull();
		await page
			.getByRole("textbox", { name: /Code reçu par email/ })
			.fill(mail.code!);
		await page.getByRole("button", { name: "Valider le code" }).click();
		await expect(
			page.getByRole("heading", { name: "Protégez votre compte" }),
		).toBeVisible();
	});

	return identity;
}
