import { expect, test } from "@playwright/test";

import { ANSWER_TIMEOUT_MS } from "../../helpers/forms/answerTimeout.ts";
import { retryUntilAnswered } from "../../helpers/forms/retryUntilAnswered.ts";
import { countMailsWithSubject } from "../../helpers/mail/countMailsWithSubject.ts";
import { waitForMailWithSubject } from "../../helpers/mail/waitForMailWithSubject.ts";
import { backToCitadelFromAuth } from "../../helpers/navigation/backToCitadelFromAuth.ts";
import { openProfile } from "../../helpers/navigation/openProfile.ts";
import { createConnectedAccount } from "../../steps/createConnectedAccount.ts";
import { logIn } from "../../steps/logIn.ts";
import { logOut } from "../../steps/logOut.ts";
import { openLoginForm } from "../../steps/openLoginForm.ts";
import { signInOnOtherBrowser } from "../../steps/signInOnOtherBrowser.ts";

const NEW_PASSWORD = "Un-nouveau-mot-de-passe-2027!";
const CHANGED_NOTICE = "Ton mot de passe a été modifié";

test.describe("Profil : mot de passe", () => {
	test("G2 : changer son mot de passe demande l'ancien, refuse le même, ferme les autres sessions et prévient par email", async ({
		page,
		browser,
	}) => {
		const identity = await createConnectedAccount(page, "judy");
		const other = await signInOnOtherBrowser(browser, identity);
		const noticesBefore = await countMailsWithSubject(
			identity.email,
			CHANGED_NOTICE,
		);

		await openProfile(page, "Sécurité");
		await page
			.getByRole("button", { name: "Changer mon mot de passe" })
			.click();
		const currentPassword = page.getByRole("textbox", {
			name: "Mot de passe actuel",
		});
		const newPassword = page.getByRole("textbox", {
			name: "Nouveau mot de passe",
		});
		const confirmation = page.getByRole("textbox", {
			name: "Confirmation du mot de passe",
		});
		const submit = page.getByRole("button", {
			name: "Enregistrer le nouveau mot de passe",
		});

		await test.step("Le bouton reste inactif tant que les trois champs ne sont pas cohérents", async () => {
			await expect(submit).toBeDisabled();
			await currentPassword.fill(identity.password);
			await newPassword.fill(NEW_PASSWORD);
			await expect(submit).toBeDisabled();
			await confirmation.fill(`${NEW_PASSWORD}x`);
			await expect(
				page.getByText("Les deux mots de passe sont différents."),
			).toBeVisible();
			await expect(submit).toBeDisabled();
		});

		await test.step("Un mauvais mot de passe actuel est refusé, et le champ est vidé", async () => {
			await currentPassword.fill("Un-mauvais-mot-de-passe-2026!");
			await confirmation.fill(NEW_PASSWORD);
			await submit.click();
			await expect(page.getByRole("alert")).toContainText(
				"le mot de passe est incorrect",
			);
			await expect(currentPassword).toHaveValue("");
		});

		await test.step("Le même mot de passe que l'actuel est refusé", async () => {
			await newPassword.fill(identity.password);
			await confirmation.fill(identity.password);
			await retryUntilAnswered(async () => {
				await currentPassword.fill(identity.password);
				await submit.click();
				await expect(page.getByRole("alert")).toContainText(
					"le nouveau mot de passe doit être différent de l'actuel",
					{ timeout: ANSWER_TIMEOUT_MS },
				);
			});
		});

		await test.step("Un nouveau mot de passe valide : changé, les autres sessions sont fermées", async () => {
			await newPassword.fill(NEW_PASSWORD);
			await confirmation.fill(NEW_PASSWORD);
			await retryUntilAnswered(async () => {
				await currentPassword.fill(identity.password);
				await submit.click();
				await expect(
					page.getByText(
						"Mot de passe changé. Vos autres sessions ont été fermées.",
					),
				).toBeVisible({ timeout: ANSWER_TIMEOUT_MS });
			});
		});

		await test.step("Cette session est gardée, l'autre navigateur est déconnecté", async () => {
			await page.reload();
			await expect(
				page.getByRole("heading", { level: 1, name: "Votre profil" }),
			).toBeVisible();
			await other.page.reload();
			await expect(
				other.page.getByRole("link", { name: "Se connecter" }),
			).toBeVisible();
		});

		await test.step("L'avis de changement est arrivé par email", async () => {
			const notice = await waitForMailWithSubject(
				identity.email,
				CHANGED_NOTICE,
				{ alreadyReceived: noticesBefore },
			);
			expect(notice.code, "un avis ne porte aucun code").toBeNull();
		});

		await test.step("Seul le nouveau mot de passe connecte désormais", async () => {
			await backToCitadelFromAuth(page);
			await logOut(page);
			await openLoginForm(page);
			await logIn(page, { ...identity, password: NEW_PASSWORD });
			await expect(
				page.getByRole("button", { name: "Se déconnecter" }),
			).toBeVisible();
		});
	});
});
