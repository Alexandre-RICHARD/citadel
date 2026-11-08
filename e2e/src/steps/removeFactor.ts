import { expect, type Page, test } from "@playwright/test";

import { ANSWER_TIMEOUT_MS } from "../helpers/forms/answerTimeout.ts";
import { retryUntilAnswered } from "../helpers/forms/retryUntilAnswered.ts";
import { factorRow } from "../helpers/profile/factorRow.ts";

/**
 * Depuis la page « Ton profil » : retire le facteur de ce nom (« Téléphone », « Code par email »…) avec le mot de passe,
 * en passant d'abord par un mauvais mot de passe si `wrongFirst` (le facteur doit alors rester)
 */
export async function removeFactor(
	page: Page,
	name: string,
	password: string,
	{ wrongFirst = false }: { wrongFirst?: boolean } = {},
): Promise<void> {
	await test.step(`Retirer « ${name} » avec le mot de passe`, async () => {
		await page.getByRole("button", { name: `Retirer ${name}` }).click();
		const passwordField = page.getByRole("textbox", {
			name: "Ton mot de passe",
		});
		if (wrongFirst) {
			await passwordField.fill("Un-mauvais-mot-de-passe-2026!");
			await page.getByRole("button", { name: "Retirer", exact: true }).click();
			await expect(page.getByRole("alert")).toContainText(
				"le mot de passe est incorrect",
			);
			await expect(factorRow(page, name)).toBeVisible();
		}
		// Après un refus, le serveur impose un court délai : l'envoi est repris jusqu'à avoir une réponse
		await retryUntilAnswered(async () => {
			await passwordField.fill(password);
			await page.getByRole("button", { name: "Retirer", exact: true }).click();
			await expect(factorRow(page, name)).toBeHidden({
				timeout: ANSWER_TIMEOUT_MS,
			});
		});
	});
}
