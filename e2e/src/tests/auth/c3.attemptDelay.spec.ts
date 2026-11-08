import { expect, test } from "@playwright/test";

import { ApiPathEnum } from "../../helpers/api/apiPath.enum.ts";
import { callApi } from "../../helpers/api/callApi.ts";
import { createConnectedAccount } from "../../steps/createConnectedAccount.ts";
import { fillLoginForm } from "../../steps/fillLoginForm.ts";
import { logOut } from "../../steps/logOut.ts";
import { openLoginForm } from "../../steps/openLoginForm.ts";

const WRONG_PASSWORD = "Un-mauvais-mot-de-passe-2026!";

test.describe("Connexion", () => {
	test("C3 : deux essais rapprochés attendent un délai, qui vise le compte et non l'identifiant", async ({
		page,
	}) => {
		const accountA = await createConnectedAccount(page, "carol");
		await logOut(page);
		const accountB = await createConnectedAccount(page, "dave");
		await logOut(page);
		await openLoginForm(page);

		await test.step("Un mauvais mot de passe puis un second aussitôt : le bouton attend, compte à rebours affiché", async () => {
			const wrongLogin = {
				identifier: accountA.email,
				password: WRONG_PASSWORD,
			};
			await fillLoginForm(page, wrongLogin);
			await expect(page.getByRole("alert")).toBeVisible();
			await fillLoginForm(page, wrongLogin);
			const waitingButton = page.getByRole("button", {
				name: /^Patiente \d+ s$/,
			});
			await expect(waitingButton).toBeVisible();
			await expect(waitingButton).toBeDisabled();
			// Le délai passé, le bouton redevient « Se connecter »
			await expect(
				page.getByRole("button", { name: "Se connecter", exact: true }),
			).toBeEnabled();
		});

		// Le front attend déjà : les essais suivants partent directement vers l'API, pour vérifier le serveur
		async function attempt(identifier: string) {
			return callApi(page, {
				method: "POST",
				path: ApiPathEnum.AUTH_LOGIN_PASSWORD,
				body: { identifier, password: WRONG_PASSWORD, remember: false },
			});
		}

		await test.step("Par le pseudo du compte A, puis aussitôt par son adresse : le second essai est retenu", async () => {
			const first = await attempt(accountA.username);
			expect(first.status, "premier essai (mauvais mot de passe)").toBe(401);
			const second = await attempt(accountA.email);
			expect(second.status, "second essai, même compte").toBe(429);
			expect(second.headers["retry-after"], "Retry-After").toBeDefined();
		});

		await test.step("Par l'adresse du compte B, aussitôt : pas d'attente", async () => {
			const other = await attempt(accountB.email);
			expect(other.status, "essai sur un autre compte").toBe(401);
		});
	});
});
