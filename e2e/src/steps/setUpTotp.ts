import { expect, type Page, test } from "@playwright/test";

import { computeTotp } from "../helpers/totp/computeTotp.ts";

/**
 * Part du formulaire d'ajout d'une application d'authentification (étape « Protège ton compte », ou profil après
 * « Ajouter une application ») : nomme l'application, lit la clé affichée, saisit le code qu'elle afficherait (celui du pas
 * actuel, ou décalé de `stepOffset` pas) et active. Se termine sur le panneau « Tes codes de secours » (`givesRecoveryCodes`, vrai pour la première double authentification du compte seulement, sinon la liste des facteurs). Renvoie la clé (base32), pour calculer les codes suivants
 */
export async function setUpTotp(
	page: Page,
	{
		name,
		stepOffset = 0,
		givesRecoveryCodes = true,
	}: { name?: string; stepOffset?: number; givesRecoveryCodes?: boolean } = {},
): Promise<string> {
	await test.step("Nommer l'application et continuer", async () => {
		if (name !== undefined)
			await page
				.getByRole("textbox", { name: /Nom de l.application/ })
				.fill(name);
		await page.getByRole("button", { name: "Continuer" }).click();
		await expect(page.getByRole("img", { name: /QR code/ })).toBeVisible();
	});

	const secret = (await page.locator("code").innerText()).trim();
	expect(secret, "la clé à saisir à la main est affichée").not.toBe("");

	await test.step("Saisir le premier code de l'application et activer", async () => {
		await page
			.getByRole("textbox", { name: /Code de l.application/ })
			.fill(computeTotp(secret, stepOffset));
		await page.getByRole("button", { name: "Activer" }).click();
		if (givesRecoveryCodes)
			await expect(
				page.getByRole("heading", { name: "Tes codes de secours" }),
			).toBeVisible();
		else await expect(page.getByText("Ajouté le").first()).toBeVisible();
	});

	return secret;
}
