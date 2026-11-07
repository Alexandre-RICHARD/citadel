import { expect, test } from "@playwright/test";

import { createIdentity } from "../../helpers/identity/createIdentity.ts";
import { countMailsWithSubject } from "../../helpers/mail/countMailsWithSubject.ts";
import { waitForMailWithSubject } from "../../helpers/mail/waitForMailWithSubject.ts";
import { openContactForm } from "../../steps/openContactForm.ts";
import { sendContactMessage } from "../../steps/sendContactMessage.ts";

const CONTACT_ADDRESS = "contact@alexandre-richard.fr";

test.describe("Contact", () => {
	test("L6 : sans adresse, aucun accusé ; avec une adresse déjà accusée le jour même (même en majuscules), pas de nouvel accusé mais la notification part", async ({
		page,
	}) => {
		const visitor = createIdentity("visiteur");
		const anonymousSubject = `Sans adresse ${visitor.username}`;
		const firstSubject = `Premier ${visitor.username}`;
		const secondSubject = `Second ${visitor.username}`;

		await openContactForm(page);

		await test.step("Sans adresse email : on ne pourra pas répondre, et aucun accusé ne part", async () => {
			await sendContactMessage(page, {
				subject: anonymousSubject,
				message: "Un message sans adresse.",
			});
			await expect(
				page.getByText("Sans adresse email, je ne pourrai pas vous répondre."),
			).toBeVisible();
			await waitForMailWithSubject(
				CONTACT_ADDRESS,
				`[Contact] ${anonymousSubject}`,
			);
			expect(
				await countMailsWithSubject(
					CONTACT_ADDRESS,
					`Message bien reçu : ${anonymousSubject}`,
				),
				"aucun accusé de réception",
			).toBe(0);
			await page
				.getByRole("button", { name: "Écrire un autre message" })
				.click();
		});

		await test.step("Un premier message avec une adresse : accusé de réception envoyé", async () => {
			await sendContactMessage(page, {
				email: visitor.email,
				subject: firstSubject,
				message: "Un premier message.",
			});
			await expect(
				page.getByText(
					`Un accusé de réception est parti vers ${visitor.email}.`,
				),
			).toBeVisible();
			await waitForMailWithSubject(
				visitor.email,
				`Message bien reçu : ${firstSubject}`,
			);
			await page
				.getByRole("button", { name: "Écrire un autre message" })
				.click();
		});

		await test.step("Un second message, même adresse en majuscules, le même jour : pas de nouvel accusé", async () => {
			await sendContactMessage(page, {
				email: visitor.email.toUpperCase(),
				subject: secondSubject,
				message: "Un second message.",
			});
			await expect(
				page.getByText(/a déjà reçu un accusé de réception aujourd.hui/),
			).toBeVisible();
		});

		await test.step("La notification du second message part quand même, sans accusé", async () => {
			await waitForMailWithSubject(
				CONTACT_ADDRESS,
				`[Contact] ${secondSubject}`,
			);
			expect(
				await countMailsWithSubject(
					visitor.email,
					`Message bien reçu : ${secondSubject}`,
				),
				"aucun second accusé",
			).toBe(0);
		});
	});
});
