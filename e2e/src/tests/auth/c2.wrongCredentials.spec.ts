import { expect, type Page, test } from "@playwright/test";

import { E2EUrlEnum } from "../../dictionaries/e2eUrl.enum.ts";
import { createIdentity } from "../../helpers/identity/createIdentity.ts";
import { createConnectedAccount } from "../../steps/createConnectedAccount.ts";
import { fillLoginForm } from "../../steps/fillLoginForm.ts";
import { logOut } from "../../steps/logOut.ts";
import { openLoginForm } from "../../steps/openLoginForm.ts";

const REFUSAL_MESSAGE =
	"Impossible de vous connecter : identifiant ou mot de passe incorrect.";
// Deux réponses de durées trop différentes laisseraient deviner si le compte existe
const MAX_RESPONSE_TIME_GAP_MS = 1_000;

/** Envoie le formulaire, lit le message de refus et la durée de la réponse du serveur */
async function failToLogIn(
	page: Page,
	{ identifier, password }: { identifier: string; password: string },
): Promise<{ message: string; responseTimeMs: number }> {
	const responsePromise = page.waitForResponse(
		(response) =>
			response.url().endsWith("/api/auth/login/password") &&
			response.request().method() === "POST",
	);
	await fillLoginForm(page, { identifier, password });
	const response = await responsePromise;
	const { startTime, responseEnd } = response.request().timing();
	const message = (await page.getByRole("alert").innerText()).trim();
	return { message, responseTimeMs: responseEnd - startTime };
}

test.describe("Connexion", () => {
	test("C2 : un identifiant inconnu et un mauvais mot de passe donnent le même refus, mot de passe vidé, en un temps comparable", async ({
		page,
	}) => {
		const identity = await createConnectedAccount(page, "carol");
		await logOut(page);
		await openLoginForm(page);

		const unknown = await test.step("Identifiant inconnu", async () => {
			const result = await failToLogIn(page, {
				identifier: createIdentity("ghost").email,
				password: identity.password,
			});
			expect(result.message).toContain(REFUSAL_MESSAGE);
			await expect(
				page.getByRole("textbox", { name: "Mot de passe" }),
			).toHaveValue("");
			return result;
		});

		// Le délai entre deux essais vise le compte : l'identifiant inconnu n'en impose pas à l'autre
		const wrongPassword =
			await test.step("Bon identifiant, mauvais mot de passe : même message, mot de passe vidé", async () => {
				const result = await failToLogIn(page, {
					identifier: identity.email,
					password: "Un-mauvais-mot-de-passe-2026!",
				});
				expect(result.message).toContain(REFUSAL_MESSAGE);
				await expect(
					page.getByRole("textbox", { name: "Mot de passe" }),
				).toHaveValue("");
				return result;
			});

		// Les deux réponses prennent un temps comparable : sinon la durée dirait si le compte existe
		expect(
			Math.abs(unknown.responseTimeMs - wrongPassword.responseTimeMs),
			`inconnu : ${Math.round(unknown.responseTimeMs)} ms, mauvais mot de passe : ${Math.round(wrongPassword.responseTimeMs)} ms`,
		).toBeLessThan(MAX_RESPONSE_TIME_GAP_MS);

		await test.step("Aucune session n'a été ouverte", async () => {
			await expect(page).toHaveURL(new RegExp(`${E2EUrlEnum.AUTH_LOGIN}`));
		});
	});
});
