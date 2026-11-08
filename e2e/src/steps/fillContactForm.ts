import { type Page, test } from "@playwright/test";

type ContactFields = {
	name?: string;
	email?: string;
	subject?: string;
	message?: string;
	// Le champ piège « Site web (laisser vide) » : un robot le remplit, jamais un humain
	website?: string;
};

/** Remplit les champs donnés du formulaire de contact déjà affiché (les autres restent vides), sans l'envoyer */
export async function fillContactForm(
	page: Page,
	{ name, email, subject, message, website }: ContactFields,
): Promise<void> {
	await test.step("Remplir le formulaire de contact", async () => {
		if (name !== undefined)
			await page.getByRole("textbox", { name: /^Nom/ }).fill(name);
		if (email !== undefined)
			await page.getByRole("textbox", { name: /^Adresse email/ }).fill(email);
		if (subject !== undefined)
			await page.getByRole("textbox", { name: /^Sujet/ }).fill(subject);
		if (message !== undefined)
			await page.getByRole("textbox", { name: /^Message/ }).fill(message);
		// Hors de l'écran : seul un script peut y écrire
		if (website !== undefined)
			await page.locator('input[name="website"]').fill(website);
	});
}
