import { expect, type Page, test } from "@playwright/test";

import { fillContactForm } from "./fillContactForm.ts";

type ContactFields = Parameters<typeof fillContactForm>[1];

/**
 * Remplit le formulaire de contact déjà affiché, l'envoie et attend l'écran « Message envoyé ». `Écrire un autre message`
 * le rouvre ensuite, vide
 */
export async function sendContactMessage(
	page: Page,
	fields: ContactFields,
): Promise<void> {
	await fillContactForm(page, fields);
	await test.step("Envoyer le message", async () => {
		await page.getByRole("button", { name: "Envoyer" }).click();
		await expect(
			page.getByRole("heading", { name: "Message envoyé" }),
		).toBeVisible();
	});
}
