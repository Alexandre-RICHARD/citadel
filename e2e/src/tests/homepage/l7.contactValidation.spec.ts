/* eslint-disable no-await-in-loop -- les étapes d'un scénario s'enchaînent dans l'ordre : chaque tour attend le précédent */
import { expect, test } from "@playwright/test";

import { createIdentity } from "../../helpers/identity/createIdentity.ts";
import { countMailsWithSubject } from "../../helpers/mail/countMailsWithSubject.ts";
import { waitForMailWithSubject } from "../../helpers/mail/waitForMailWithSubject.ts";
import { fillContactForm } from "../../steps/fillContactForm.ts";
import { openContactForm } from "../../steps/openContactForm.ts";
import { sendContactMessage } from "../../steps/sendContactMessage.ts";

const CONTACT_ADDRESS = "contact@alexandre-richard.fr";

// Les longueurs maximales de chaque champ (packages/specs, ContactFieldMaxLengthEnum)
const MAX_LENGTHS = [
	{ field: /^Nom/, max: 100 },
	{ field: /^Adresse email/, max: 254 },
	{ field: /^Sujet/, max: 150 },
	{ field: /^Message/, max: 5000 },
] as const;

test.describe("Contact", () => {
	test("L7 : sujet et message obligatoires, longueurs maximales, email au bon format, nom et email facultatifs ; le champ piège ne déclenche aucun email", async ({
		page,
	}) => {
		const visitor = createIdentity("visiteur");
		const trapSubject = `Piège ${visitor.username}`;
		const realSubject = `Réel ${visitor.username}`;

		await openContactForm(page);
		const send = page.getByRole("button", { name: "Envoyer" });

		await test.step("Le sujet est obligatoire", async () => {
			await send.click();
			await expect(
				page.getByText("Le sujet doit contenir au moins 1 caractère."),
			).toBeVisible();
		});

		await test.step("Le message est obligatoire", async () => {
			await fillContactForm(page, { subject: "Un sujet" });
			await send.click();
			await expect(
				page.getByText("Le message doit contenir au moins 1 caractère."),
			).toBeVisible();
		});

		await test.step("Chaque champ s'arrête à sa longueur maximale", async () => {
			for (const { field, max } of MAX_LENGTHS) {
				const textbox = page.getByRole("textbox", { name: field });
				await expect(textbox).toHaveAttribute("maxlength", String(max));
				await textbox.fill("x".repeat(max + 50));
				expect(
					(await textbox.inputValue()).length,
					`${field}`,
				).toBeLessThanOrEqual(max);
			}
		});

		await test.step("Une adresse email mal formée est refusée", async () => {
			await fillContactForm(page, {
				email: "pas-une-adresse",
				subject: "Un sujet",
				message: "Un message",
			});
			await send.click();
			await expect(
				page.getByText("L'adresse email n'est pas au format attendu."),
			).toBeVisible();
		});

		await test.step("Le nom et l'email sont facultatifs : sujet et message suffisent", async () => {
			await fillContactForm(page, { name: "", email: "" });
			await send.click();
			await expect(
				page.getByRole("heading", { name: "Message envoyé" }),
			).toBeVisible();
			await page
				.getByRole("button", { name: "Écrire un autre message" })
				.click();
		});

		await test.step("Le champ piège rempli : réponse « Sans adresse email… » et aucun email", async () => {
			await sendContactMessage(page, {
				email: visitor.email,
				subject: trapSubject,
				message: "Un message de robot.",
				website: "https://spam.example",
			});
			await expect(
				page.getByText("Sans adresse email, je ne pourrai pas vous répondre."),
			).toBeVisible();
			await page
				.getByRole("button", { name: "Écrire un autre message" })
				.click();
		});

		await test.step("Un vrai message qui suit arrive, pas celui du robot", async () => {
			await sendContactMessage(page, {
				subject: realSubject,
				message: "Un vrai message.",
			});
			// Les emails partent dans l'ordre : quand le vrai est là, celui du robot l'aurait précédé
			await waitForMailWithSubject(CONTACT_ADDRESS, `[Contact] ${realSubject}`);
			expect(
				await countMailsWithSubject(
					CONTACT_ADDRESS,
					`[Contact] ${trapSubject}`,
				),
				"notification du robot",
			).toBe(0);
			expect(
				await countMailsWithSubject(
					visitor.email,
					`Message bien reçu : ${trapSubject}`,
				),
				"accusé au robot",
			).toBe(0);
		});
	});
});
