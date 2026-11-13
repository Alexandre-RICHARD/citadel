import { expect, test } from "@playwright/test";

import { E2EUrlEnum } from "../../dictionaries/e2eUrl.enum.ts";
import { createIdentity } from "../../helpers/identity/createIdentity.ts";
import { waitForMail } from "../../helpers/mail/waitForMail.ts";
import { fillRegistrationForm } from "../../steps/fillRegistrationForm.ts";
import { openRegistrationForm } from "../../steps/openRegistrationForm.ts";

test.describe("Inscription", () => {
	test("A2 : créer un compte en tapant le code du mail dans l'onglet resté ouvert", async ({
		page,
	}) => {
		const identity = createIdentity("alice");

		await openRegistrationForm(page);
		await fillRegistrationForm(page, identity);

		const mail =
			await test.step("Recevoir le mail de confirmation", async () => {
				const received = await waitForMail(identity.email);
				expect(received.code, "le mail contient un code").not.toBeNull();
				return received;
			});

		await test.step("« Valider le code » est inactif tant que le code est incomplet", async () => {
			const validate = page.getByRole("button", { name: "Valider le code" });
			await page
				.getByRole("textbox", { name: /Code reçu par email/ })
				.fill("123");
			await expect(validate).toBeDisabled();
		});

		await test.step("Taper le code du mail, sans ouvrir le lien : le compte est créé", async () => {
			await page
				.getByRole("textbox", { name: /Code reçu par email/ })
				.fill(mail.code!);
			await page.getByRole("button", { name: "Valider le code" }).click();
			await expect(
				page.getByRole("heading", { name: "Protégez votre compte" }),
			).toBeVisible();
		});

		await test.step("« Passer cette étape » ramène à /backlog, connecté", async () => {
			await page.getByRole("button", { name: "Passer cette étape" }).click();
			await expect(page).toHaveURL(new RegExp(`${E2EUrlEnum.BACKLOG}$`));
			await expect(
				page.getByRole("link", { name: "Mon profil" }),
			).toBeVisible();
		});
	});
});
