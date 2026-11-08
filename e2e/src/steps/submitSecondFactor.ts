import { expect, type Page, test } from "@playwright/test";

import { ANSWER_TIMEOUT_MS } from "../helpers/forms/answerTimeout.ts";
import { retryUntilAnswered } from "../helpers/forms/retryUntilAnswered.ts";

type Outcome = "accepted" | "refused";

/**
 * Part de l'étape « Double authentification » : saisit le code dans le champ affiché (application, code par email ou
 * code de secours, selon la méthode choisie), clique « Valider », puis vérifie le résultat : `accepted` (l'étape est
 * franchie : session ouverte, ou étape suivante) ou `refused` (message « ce code n'est pas valable », étape gardée).
 * `code` peut être une fonction, rappelée à chaque envoi : un code TOTP calculé trop tôt peut changer de pas avant que le serveur le juge.
 * L'envoi est repris si le serveur impose son délai après un échec (retryUntilAnswered)
 */
export async function submitSecondFactor(
	page: Page,
	code: string | (() => string),
	outcome: Outcome,
): Promise<void> {
	await test.step(`Double authentification : saisir le code, il est ${outcome === "accepted" ? "accepté" : "refusé"}`, async () => {
		await retryUntilAnswered(async () => {
			await page
				.getByRole("textbox", { name: /^Code / })
				.fill(typeof code === "string" ? code : code());
			await page.getByRole("button", { name: "Valider", exact: true }).click();
			if (outcome === "accepted")
				await expect(
					page.getByRole("heading", { name: "Double authentification" }),
				).toBeHidden({ timeout: ANSWER_TIMEOUT_MS });
			else
				await expect(page.getByRole("alert")).toContainText(
					"ce code n'est pas valable",
					{ timeout: ANSWER_TIMEOUT_MS },
				);
		});
	});
}
