import { expect, type Page, test } from "@playwright/test";

import { createIdentity } from "../helpers/identity/createIdentity.ts";
import type { Identity } from "../helpers/identity/identity.type.ts";
import { waitForMail } from "../helpers/mail/waitForMail.ts";
import { openMailLink } from "../helpers/navigation/openMailLink.ts";
import { fillRegistrationForm } from "./fillRegistrationForm.ts";

/**
 * S'inscrire : part du formulaire « Créer un compte » déjà affiché, le remplit avec une identité neuve,
 * puis confirme le compte avec le lien du mail (ouvert dans un onglet à part, refermé ensuite).
 * Renvoie l'identité créée, pour la suite du scénario
 */
export async function registerAccount(
	page: Page,
	label = "user",
): Promise<Identity> {
	const identity = createIdentity(label);

	await fillRegistrationForm(page, identity);

	const mail =
		await test.step("S'inscrire : recevoir le mail de confirmation", async () => {
			const received = await waitForMail(identity.email);
			expect(received.link, "le mail contient un lien").not.toBeNull();
			return received;
		});

	await test.step("S'inscrire : confirmer avec le lien du mail", async () => {
		const verifyPage = await openMailLink(page, mail.link!);
		await verifyPage.getByRole("button", { name: "Confirmer" }).click();
		await expect(
			verifyPage.getByRole("heading", { name: "Protégez votre compte" }),
		).toBeVisible();
		await verifyPage.close();
		// L'onglet d'origine n'a pas vu la confirmation : l'utilisateur le recharge pour retrouver son compte
		await page.reload();
	});

	return identity;
}
