import { expect, test } from "@playwright/test";

import { createIdentity } from "../../helpers/identity/createIdentity.ts";
import { countMails } from "../../helpers/mail/countMails.ts";
import { waitForMail } from "../../helpers/mail/waitForMail.ts";
import { openSite } from "../../helpers/navigation/openSite.ts";
import { computeTotp } from "../../helpers/totp/computeTotp.ts";
import { waitForSafeTotpWindow } from "../../helpers/totp/waitForSafeTotpWindow.ts";
import { createAccountWithTotp } from "../../steps/createAccountWithTotp.ts";
import { fillLoginForm } from "../../steps/fillLoginForm.ts";
import { fillRegistrationForm } from "../../steps/fillRegistrationForm.ts";
import { logOut } from "../../steps/logOut.ts";
import { openLoginForm } from "../../steps/openLoginForm.ts";
import { openRegistrationForm } from "../../steps/openRegistrationForm.ts";
import { submitSecondFactor } from "../../steps/submitSecondFactor.ts";

test.describe("Lien, code et reprise", () => {
	test("B1 : à chaque étape d'un parcours, un rechargement ramène au même endroit, champs gardés, mots de passe jamais", async ({
		page,
	}) => {
		const newcomer = createIdentity("alice");

		await openRegistrationForm(page);

		await test.step("Formulaire d'inscription : email et pseudo gardés, mots de passe vidés", async () => {
			await page
				.getByRole("textbox", { name: "Adresse email" })
				.fill(newcomer.email);
			await page
				.getByRole("textbox", { name: "Pseudo" })
				.fill(newcomer.username);
			await page
				.getByRole("textbox", { name: "Mot de passe", exact: true })
				.fill(newcomer.password);
			await page.reload();
			await expect(
				page.getByRole("textbox", { name: "Adresse email" }),
			).toHaveValue(newcomer.email);
			await expect(page.getByRole("textbox", { name: "Pseudo" })).toHaveValue(
				newcomer.username,
			);
			await expect(
				page.getByRole("textbox", { name: "Mot de passe", exact: true }),
			).toHaveValue("");
		});

		await test.step("Écran du code d'inscription : le rechargement revient au même écran", async () => {
			await fillRegistrationForm(page, newcomer);
			await page.reload();
			await expect(
				page.getByRole("heading", { name: "Confirmez votre adresse email" }),
			).toBeVisible();
			await expect(page.getByText(newcomer.email)).toBeVisible();
			// Abandonner le parcours : le formulaire revient (B8)
			await page.getByRole("button", { name: "Recommencer" }).click();
			await expect(
				page.getByRole("heading", { name: "Créer un compte" }),
			).toBeVisible();
		});

		// Un compte protégé par une application, pour atteindre le second facteur et le nouveau mot de passe
		const account = await createAccountWithTotp(page, "bob");
		const { identity, secret } = account;
		await logOut(page);

		await openLoginForm(page);

		await test.step("Formulaire de connexion : identifiant gardé, mot de passe vidé", async () => {
			await page
				.getByRole("textbox", { name: "Adresse email ou pseudo" })
				.fill(identity.email);
			await page
				.getByRole("textbox", { name: "Mot de passe" })
				.fill(identity.password);
			await page.reload();
			await expect(
				page.getByRole("textbox", { name: "Adresse email ou pseudo" }),
			).toHaveValue(identity.email);
			await expect(
				page.getByRole("textbox", { name: "Mot de passe" }),
			).toHaveValue("");
		});

		await test.step("Second facteur de la connexion : le rechargement revient à « Double authentification »", async () => {
			await fillLoginForm(page, {
				identifier: identity.email,
				password: identity.password,
			});
			await expect(
				page.getByRole("heading", { name: "Double authentification" }),
			).toBeVisible();
			await page.reload();
			await expect(
				page.getByRole("heading", { name: "Double authentification" }),
			).toBeVisible();
			await page.getByRole("button", { name: "Recommencer" }).click();
			await expect(
				page.getByRole("heading", { name: "Se connecter" }),
			).toBeVisible();
		});

		await test.step("Formulaire du mot de passe oublié : identifiant gardé", async () => {
			await page.getByRole("link", { name: "Mot de passe oublié ?" }).click();
			await page
				.getByRole("textbox", { name: "Adresse email ou pseudo" })
				.fill(identity.username);
			await page.reload();
			await expect(
				page.getByRole("textbox", { name: "Adresse email ou pseudo" }),
			).toHaveValue(identity.username);
		});

		const mailsBefore = await countMails(identity.email);

		await test.step("Écran du code du mot de passe oublié : le rechargement revient au même écran", async () => {
			await page.getByRole("button", { name: /Recevoir l.email/ }).click();
			await expect(
				page.getByRole("heading", { name: "Vérifiez vos emails" }),
			).toBeVisible();
			await page.reload();
			await expect(
				page.getByRole("heading", { name: "Vérifiez vos emails" }),
			).toBeVisible();
		});

		await test.step("Second facteur du mot de passe oublié : le rechargement revient à « Double authentification »", async () => {
			const mail = await waitForMail(identity.email, {
				afterCount: mailsBefore,
			});
			await page
				.getByRole("textbox", { name: /Code reçu par email/ })
				.fill(mail.code!);
			await page.getByRole("button", { name: "Valider le code" }).click();
			await expect(
				page.getByRole("heading", { name: "Double authentification" }),
			).toBeVisible();
			await page.reload();
			await expect(
				page.getByRole("heading", { name: "Double authentification" }),
			).toBeVisible();
		});

		await test.step("Nouveau mot de passe : le rechargement revient au même formulaire, champs vides", async () => {
			await waitForSafeTotpWindow();
			// Le code de l'activation a consommé le pas de l'époque : le pas suivant est accepté (±1 pas)
			await submitSecondFactor(page, computeTotp(secret, 1), "accepted");
			await expect(
				page.getByRole("heading", {
					name: "Choisissez un nouveau mot de passe",
				}),
			).toBeVisible();
			await page
				.getByRole("textbox", { name: "Nouveau mot de passe" })
				.fill("Un-autre-mot-de-passe-2027!");
			await page.reload();
			await expect(
				page.getByRole("heading", {
					name: "Choisissez un nouveau mot de passe",
				}),
			).toBeVisible();
			await expect(
				page.getByRole("textbox", { name: "Nouveau mot de passe" }),
			).toHaveValue("");
		});

		await test.step("Le parcours abandonné ne connecte personne : le site rouvre sans session", async () => {
			await openSite(page);
			await expect(
				page.getByRole("link", { name: "Se connecter" }),
			).toBeVisible();
		});
	});
});
