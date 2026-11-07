import { expect, test } from "@playwright/test";

import { createIdentity } from "../../helpers/identity/createIdentity.ts";
import { waitForMail } from "../../helpers/mail/waitForMail.ts";
import { openMailLink } from "../../helpers/navigation/openMailLink.ts";
import { returnToTab } from "../../helpers/navigation/returnToTab.ts";
import { fillRegistrationForm } from "../../steps/fillRegistrationForm.ts";
import { openRegistrationForm } from "../../steps/openRegistrationForm.ts";

test.describe("Lien, code et reprise", () => {
	test("B2 : le lien ouvert dans un second onglet valide, et l'onglet d'origine passe seul à la suite", async ({
		page,
	}) => {
		const identity = createIdentity("alice");

		await openRegistrationForm(page);
		await fillRegistrationForm(page, identity);
		const mail = await waitForMail(identity.email);

		const linkPage =
			await test.step("Ouvrir le lien du mail dans un second onglet et confirmer", async () => {
				const tab = await openMailLink(page, mail.link!);
				await tab.getByRole("button", { name: "Confirmer" }).click();
				await expect(
					tab.getByRole("heading", { name: "Protège ton compte" }),
				).toBeVisible();
				return tab;
			});

		await test.step("Revenir sur l'onglet d'origine : il passe seul à « Protège ton compte »", async () => {
			await returnToTab(page);
			await expect(
				page.getByRole("heading", { name: "Protège ton compte" }),
			).toBeVisible();
		});

		await test.step("Le second onglet reste utilisable", async () => {
			await expect(
				linkPage.getByRole("heading", { name: "Protège ton compte" }),
			).toBeVisible();
		});
	});
});
