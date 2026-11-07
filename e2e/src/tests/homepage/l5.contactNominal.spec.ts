import { expect, test } from "@playwright/test";

import { createIdentity } from "../../helpers/identity/createIdentity.ts";
import { waitForMailWithSubject } from "../../helpers/mail/waitForMailWithSubject.ts";
import { openContactForm } from "../../steps/openContactForm.ts";
import { sendContactMessage } from "../../steps/sendContactMessage.ts";

// L'adresse qui reçoit les notifications du formulaire (packages/specs/src/projects/contact/contactEmail.ts)
const CONTACT_ADDRESS = "contact@alexandre-richard.fr";

test.describe("Contact", () => {
	test("L5 : un message envoyé arrive en notification à contact@ (réponse à l'expéditeur) et reçoit un accusé de réception qui ne reprend que le sujet", async ({
		page,
	}) => {
		const visitor = createIdentity("visiteur");
		const subject = `Une question ${visitor.username}`;
		const message = `Bonjour, ceci est le texte secret ${visitor.username}.`;

		await openContactForm(page);

		await test.step("Le compteur de caractères du message suit la saisie", async () => {
			await expect(page.getByText("0 / 5000")).toBeVisible();
			await page.getByRole("textbox", { name: /^Message/ }).fill(message);
			await expect(page.getByText(`${message.length} / 5000`)).toBeVisible();
		});

		await sendContactMessage(page, {
			name: "Visiteur de test",
			email: visitor.email,
			subject,
			message,
		});

		await test.step("L'écran « Message envoyé » annonce l'accusé de réception et propose un autre message", async () => {
			await expect(
				page.getByText(
					`Un accusé de réception est parti vers ${visitor.email}.`,
				),
			).toBeVisible();
			await page
				.getByRole("button", { name: "Écrire un autre message" })
				.click();
			await expect(page.getByRole("textbox", { name: /^Sujet/ })).toHaveValue(
				"",
			);
		});

		await test.step("La notification arrive à contact@, avec le message et l'expéditeur en réponse", async () => {
			const notification = await waitForMailWithSubject(
				CONTACT_ADDRESS,
				`[Contact] ${subject}`,
			);
			expect(notification.to).toContain(CONTACT_ADDRESS);
			expect(notification.replyTo).toContain(visitor.email);
			expect(notification.text).toContain(message);
		});

		await test.step("L'accusé de réception part vers le visiteur et ne reprend que le sujet", async () => {
			const acknowledgement = await waitForMailWithSubject(
				visitor.email,
				`Message bien reçu : ${subject}`,
			);
			expect(acknowledgement.to).toContain(visitor.email);
			expect(acknowledgement.text).not.toContain(message);
		});
	});
});
