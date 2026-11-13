import { expect, test } from "@playwright/test";

import { E2EUrlEnum } from "../../dictionaries/e2eUrl.enum.ts";
import { createGdcData } from "../../helpers/api/createGdcData.ts";
import { retryUntilAnswered } from "../../helpers/forms/retryUntilAnswered.ts";
import { waitForMailWithSubject } from "../../helpers/mail/waitForMailWithSubject.ts";
import { backToCitadel } from "../../helpers/navigation/backToCitadel.ts";
import { openProfile } from "../../helpers/navigation/openProfile.ts";
import { openProfileCategory } from "../../helpers/navigation/openProfileCategory.ts";
import { openProjectFromHomepage } from "../../helpers/navigation/openProjectFromHomepage.ts";
import { computeTotp } from "../../helpers/totp/computeTotp.ts";
import { waitForSafeTotpWindow } from "../../helpers/totp/waitForSafeTotpWindow.ts";
import { createConnectedAccount } from "../../steps/createConnectedAccount.ts";
import { enableTotp } from "../../steps/enableTotp.ts";
import { fillLoginForm } from "../../steps/fillLoginForm.ts";
import { openLoginForm } from "../../steps/openLoginForm.ts";
import { openRegistrationForm } from "../../steps/openRegistrationForm.ts";
import { registerWithCode } from "../../steps/registerWithCode.ts";
import { signInOnOtherBrowser } from "../../steps/signInOnOtherBrowser.ts";

test.describe("Profil : suppression du compte", () => {
	test("G10 : supprimer son compte demande le mot de passe et le code de l'application, efface tout, et libère l'adresse et le pseudo", async ({
		page,
		browser,
	}) => {
		await waitForSafeTotpWindow();
		const identity = await createConnectedAccount(page, "paul");
		// Une seconde session, ouverte avant la double authentification
		const other = await signInOnOtherBrowser(browser, identity);
		await createGdcData(page, {
			gameName: "Un jeu à effacer",
			bossName: "Un boss à effacer",
		});

		await openProfile(page, "Sécurité");
		const { secret } = await enableTotp(page);
		await openProfileCategory(page, "Mes données");
		const deleteButton = page.getByRole("button", {
			name: "Supprimer définitivement mon compte",
		});

		await test.step("« Supprimer mon compte » annonce que c'est immédiat et définitif", async () => {
			await page.getByRole("button", { name: "Supprimer mon compte" }).click();
			await expect(
				page.getByText(
					"La suppression est immédiate et définitive. Aucun délai de récupération",
				),
			).toBeVisible();
		});

		await test.step("Avec une application d'authentification, le mot de passe ne suffit pas : le code est demandé aussi", async () => {
			await page
				.getByRole("textbox", { name: "Votre mot de passe" })
				.fill(identity.password);
			await expect(deleteButton).toBeDisabled();
			await page
				.getByRole("textbox", {
					name: /Code de votre application, ou code de secours/,
				})
				.fill("000000");
			await expect(deleteButton).toBeEnabled();
		});

		await test.step("Un code faux ne supprime rien", async () => {
			await deleteButton.click();
			await expect(
				page
					.getByRole("alert")
					.filter({ hasText: "ce code n'est pas valable" }),
			).toBeVisible();
			await expect(
				page.getByRole("heading", { level: 1, name: "Votre profil" }),
			).toBeVisible();
		});

		await test.step("Le mot de passe et un code valides suppriment le compte : retour à la homepage, déconnecté", async () => {
			await retryUntilAnswered(async () => {
				await page
					.getByRole("textbox", {
						name: /Code de votre application, ou code de secours/,
					})
					.fill(computeTotp(secret, 1));
				await deleteButton.click();
				await expect(page).toHaveURL(new RegExp(`${E2EUrlEnum.HOMEPAGE}`), {
					timeout: 3_000,
				});
			});
			await expect(
				page.getByRole("link", { name: "Se connecter" }),
			).toBeVisible();
		});

		await test.step("Les sessions des autres navigateurs sont mortes avec le compte", async () => {
			await other.page.reload();
			await expect(
				other.page.getByRole("link", { name: "Se connecter" }),
			).toBeVisible();
		});

		await test.step("Un email confirme la suppression", async () => {
			await waitForMailWithSubject(identity.email, "Ton compte a été supprimé");
		});

		await test.step("Se reconnecter est impossible", async () => {
			await openLoginForm(page);
			await fillLoginForm(page, {
				identifier: identity.email,
				password: identity.password,
			});
			await expect(page.getByRole("alert")).toContainText(
				"identifiant ou mot de passe incorrect",
			);
		});

		await test.step("L'adresse et le pseudo sont de nouveau libres : une inscription avec les mêmes réussit", async () => {
			await openRegistrationForm(page);
			await registerWithCode(page, { identity });
		});

		await test.step("Le nouveau compte ne retrouve rien de l'ancien", async () => {
			await page.getByRole("button", { name: "Passer cette étape" }).click();
			await backToCitadel(page);
			await openProjectFromHomepage(page, "Game Death Counter");
			await expect(page.getByText("Aucun jeu enregistré")).toBeVisible();
		});
	});
});
