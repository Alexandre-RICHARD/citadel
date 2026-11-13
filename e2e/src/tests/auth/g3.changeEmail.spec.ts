import { expect, test } from "@playwright/test";

import { E2EUrlEnum } from "../../dictionaries/e2eUrl.enum.ts";
import { openOtherBrowser } from "../../helpers/browser/openOtherBrowser.ts";
import { createIdentity } from "../../helpers/identity/createIdentity.ts";
import { countMails } from "../../helpers/mail/countMails.ts";
import { waitForMailWithSubject } from "../../helpers/mail/waitForMailWithSubject.ts";
import { openMailLink } from "../../helpers/navigation/openMailLink.ts";
import { openProfile } from "../../helpers/navigation/openProfile.ts";
import { createConnectedAccount } from "../../steps/createConnectedAccount.ts";
import { openRegistrationForm } from "../../steps/openRegistrationForm.ts";
import { registerWithCode } from "../../steps/registerWithCode.ts";
import { startEmailChange } from "../../steps/startEmailChange.ts";

const CHANGE_MAIL = "Confirmez votre nouvelle adresse email";
const TAKEN_MAIL = "Cette adresse email est déjà utilisée";
const CHANGED_NOTICE = "Ton adresse email a été modifiée";

test.describe("Profil : adresse email", () => {
	test("G3 : changer d'adresse (mot de passe, lien ou code à la nouvelle, avis à l'ancienne), sans rien révéler d'une adresse prise", async ({
		page,
		browser,
	}) => {
		const identity = await createConnectedAccount(page, "kate");

		// Un autre compte, dans un autre navigateur : le propriétaire de l'adresse « déjà prise »
		const owner = await openOtherBrowser(browser);
		const ownerPage = await owner.newPage();
		const ownerIdentity = await createConnectedAccount(ownerPage, "liam");

		await openProfile(page);
		const changeButton = page.getByRole("button", {
			name: "Changer mon adresse email",
		});

		await test.step("« Annuler » referme le formulaire", async () => {
			await changeButton.click();
			await expect(
				page.getByRole("textbox", { name: "Nouvelle adresse email" }),
			).toBeVisible();
			await page.getByRole("button", { name: "Annuler" }).click();
			await expect(changeButton).toBeVisible();
		});

		await test.step("La même adresse, même en majuscules, est refusée tout de suite", async () => {
			const mailsBefore = await countMails(identity.email);
			await changeButton.click();
			await page
				.getByRole("textbox", { name: "Nouvelle adresse email" })
				.fill(identity.email.toUpperCase());
			await page
				.getByRole("textbox", { name: "Votre mot de passe" })
				.fill(identity.password);
			await page
				.getByRole("button", { name: /Recevoir l.email de confirmation/ })
				.click();
			await expect(page.getByRole("alert")).toContainText(
				"cette adresse email est déjà celle de votre compte",
			);
			expect(await countMails(identity.email), "aucun email envoyé").toBe(
				mailsBefore,
			);
			await page.getByRole("button", { name: "Annuler" }).click();
		});

		await test.step("Une adresse déjà prise : même écran, et seul son propriétaire est prévenu, sans lien ni code", async () => {
			await startEmailChange(page, {
				newEmail: ownerIdentity.email,
				password: identity.password,
			});
			const notice = await waitForMailWithSubject(
				ownerIdentity.email,
				TAKEN_MAIL,
			);
			expect(notice.link ?? "", "aucun lien de confirmation").not.toContain(
				E2EUrlEnum.AUTH_VERIFY,
			);
			expect(notice.code, "aucun code").toBeNull();
			await page.getByRole("button", { name: "Recommencer" }).click();
			await expect(
				page.getByRole("heading", { level: 1, name: "Votre profil" }),
			).toBeVisible();
		});

		const newIdentity = createIdentity("kate-new");

		await test.step("Un lien ouvert dans un autre navigateur est refusé", async () => {
			await startEmailChange(page, {
				newEmail: newIdentity.email,
				password: identity.password,
			});
			const mail = await waitForMailWithSubject(newIdentity.email, CHANGE_MAIL);
			const stranger = await openOtherBrowser(browser);
			const strangerPage = await stranger.newPage();
			const linkTab = await openMailLink(strangerPage, mail.link!);
			await linkTab.getByRole("button", { name: "Confirmer" }).click();
			await expect(
				linkTab.getByText(/ouvert dans un autre navigateur/),
			).toBeVisible();
			await expect(
				linkTab.getByRole("button", { name: "Confirmer" }),
			).toHaveCount(0);
			await stranger.close();
		});

		await test.step("Le code envoyé à la nouvelle adresse confirme le changement", async () => {
			const mail = await waitForMailWithSubject(newIdentity.email, CHANGE_MAIL);
			expect(mail.code, "l'email contient un code").not.toBeNull();
			await page
				.getByRole("textbox", { name: /Code reçu par email/ })
				.fill(mail.code!);
			await page.getByRole("button", { name: "Valider le code" }).click();
			await expect(
				page.getByRole("heading", { level: 1, name: "Votre profil" }),
			).toBeVisible();
			await expect(
				page.getByText(newIdentity.email, { exact: true }),
			).toBeVisible();
		});

		await test.step("L'ancienne adresse a reçu un avis de changement", async () => {
			await waitForMailWithSubject(identity.email, CHANGED_NOTICE);
		});

		const takenLater = createIdentity("mona");

		await test.step("Une adresse prise entre-temps : le code ne la donne plus", async () => {
			await startEmailChange(page, {
				newEmail: takenLater.email,
				password: identity.password,
			});
			const mail = await waitForMailWithSubject(takenLater.email, CHANGE_MAIL);

			// Pendant ce temps, quelqu'un s'inscrit avec cette adresse (depuis un autre navigateur)
			const newcomer = await openOtherBrowser(browser);
			const newcomerPage = await newcomer.newPage();
			await openRegistrationForm(newcomerPage);
			await registerWithCode(newcomerPage, { identity: takenLater });

			await page
				.getByRole("textbox", { name: /Code reçu par email/ })
				.fill(mail.code!);
			await page.getByRole("button", { name: "Valider le code" }).click();
			await expect(page.getByRole("alert")).toContainText(
				"cette adresse email est déjà utilisée",
			);
		});
	});
});
