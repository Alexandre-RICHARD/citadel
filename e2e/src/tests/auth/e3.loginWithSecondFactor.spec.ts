import { expect, test } from "@playwright/test";

import { ApiPathEnum } from "../../helpers/api/apiPath.enum.ts";
import { callApi } from "../../helpers/api/callApi.ts";
import { backToCitadelFromAuth } from "../../helpers/navigation/backToCitadelFromAuth.ts";
import { openProfile } from "../../helpers/navigation/openProfile.ts";
import { computeTotp } from "../../helpers/totp/computeTotp.ts";
import { waitForSafeTotpWindow } from "../../helpers/totp/waitForSafeTotpWindow.ts";
import { createAccountWithTotp } from "../../steps/createAccountWithTotp.ts";
import { enableEmailFactor } from "../../steps/enableEmailFactor.ts";
import { fillLoginForm } from "../../steps/fillLoginForm.ts";
import { logOut } from "../../steps/logOut.ts";
import { openLoginForm } from "../../steps/openLoginForm.ts";
import { submitSecondFactor } from "../../steps/submitSecondFactor.ts";

test.describe("Double authentification", () => {
	test("E3 : le mot de passe ne suffit pas, le second facteur est demandé avec le choix des méthodes, aucune session avant la fin", async ({
		page,
	}) => {
		await waitForSafeTotpWindow();
		const { identity, secret } = await createAccountWithTotp(page, "grace");

		await test.step("Ajouter le code par email : trois méthodes seront proposées", async () => {
			await openProfile(page);
			await enableEmailFactor(page, identity.email);
			await backToCitadelFromAuth(page);
		});

		await logOut(page);
		await openLoginForm(page);
		await fillLoginForm(page, {
			identifier: identity.email,
			password: identity.password,
		});

		await test.step("L'étape « Double authentification » propose Application, Code par email et Code de secours", async () => {
			await expect(
				page.getByRole("heading", { name: "Double authentification" }),
			).toBeVisible();
			const methods = page.getByRole("radiogroup", {
				name: "Méthode de vérification",
			});
			await expect(methods.getByRole("radio")).toHaveCount(3);
			await expect(methods.getByText("Application")).toBeVisible();
			await expect(methods.getByText("Code par email")).toBeVisible();
			await expect(methods.getByText("Code de secours")).toBeVisible();
			await expect(methods.getByRole("radio").first()).toBeChecked();
		});

		await test.step("Le temps restant pour se connecter est affiché (10 minutes au plus)", async () => {
			await expect(
				page.getByText(/Il te reste .* pour te connecter/),
			).toContainText(/9 min \d{2} s/);
		});

		await test.step("Aucune session n'est ouverte avant le second facteur", async () => {
			const answer = await callApi(page, {
				method: "GET",
				path: ApiPathEnum.AUTH_ME,
			});
			expect(answer.status).toBe(401);
		});

		await test.step("Le code de l'application valide : connecté", async () => {
			await submitSecondFactor(page, computeTotp(secret, 1), "accepted");
			await expect(
				page.getByRole("button", { name: "Se déconnecter" }),
			).toBeVisible();
			const answer = await callApi(page, {
				method: "GET",
				path: ApiPathEnum.AUTH_ME,
			});
			expect(answer.status).toBe(200);
		});
	});
});
