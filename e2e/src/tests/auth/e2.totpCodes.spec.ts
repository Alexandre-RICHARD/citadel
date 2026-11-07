/* eslint-disable no-await-in-loop -- les étapes d'un scénario s'enchaînent dans l'ordre : chaque tour attend le précédent */
import { expect, test } from "@playwright/test";

import { backToCitadelFromAuth } from "../../helpers/navigation/backToCitadelFromAuth.ts";
import { openProfile } from "../../helpers/navigation/openProfile.ts";
import { computeTotp } from "../../helpers/totp/computeTotp.ts";
import { waitForSafeTotpWindow } from "../../helpers/totp/waitForSafeTotpWindow.ts";
import { createConnectedAccount } from "../../steps/createConnectedAccount.ts";
import { enableTotp } from "../../steps/enableTotp.ts";
import { fillLoginForm } from "../../steps/fillLoginForm.ts";
import { logOut } from "../../steps/logOut.ts";
import { openLoginForm } from "../../steps/openLoginForm.ts";
import { submitSecondFactor } from "../../steps/submitSecondFactor.ts";

test.describe("Double authentification", () => {
	test("E2 : le pas précédent et le suivant sont acceptés, deux pas d'écart refusés, le même code deux fois refusé", async ({
		page,
	}) => {
		await waitForSafeTotpWindow();
		const identity = await createConnectedAccount(page, "frank");
		await openProfile(page);

		const { secret } =
			await test.step("Activer avec le code du pas précédent : accepté", async () => {
				return enableTotp(page, { stepOffset: -1 });
			});

		await backToCitadelFromAuth(page);
		await logOut(page);
		await openLoginForm(page);
		await fillLoginForm(page, {
			identifier: identity.email,
			password: identity.password,
		});
		await expect(
			page.getByRole("heading", { name: "Double authentification" }),
		).toBeVisible();

		await test.step("Deux pas en arrière, puis deux pas en avant : refusés", async () => {
			for (const offset of [-2, 2]) {
				await submitSecondFactor(
					page,
					() => computeTotp(secret, offset),
					"refused",
				);
			}
		});

		const nextStepCode = computeTotp(secret, 1);

		await test.step("Le pas suivant : accepté, la session s'ouvre", async () => {
			await submitSecondFactor(page, nextStepCode, "accepted");
			await expect(
				page.getByRole("button", { name: "Se déconnecter" }),
			).toBeVisible();
		});

		await logOut(page);
		await openLoginForm(page);
		await fillLoginForm(page, {
			identifier: identity.email,
			password: identity.password,
		});

		await test.step("Le même code une seconde fois : refusé", async () => {
			await submitSecondFactor(page, nextStepCode, "refused");
			await expect(
				page.getByRole("heading", { name: "Double authentification" }),
			).toBeVisible();
		});
	});
});
