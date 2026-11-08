import { readFile } from "node:fs/promises";

import { expect, test } from "@playwright/test";

import { ApiPathEnum } from "../../helpers/api/apiPath.enum.ts";
import { callApi } from "../../helpers/api/callApi.ts";
import { openProfile } from "../../helpers/navigation/openProfile.ts";
import { readRecoveryCodes } from "../../helpers/profile/readRecoveryCodes.ts";
import { computeTotp } from "../../helpers/totp/computeTotp.ts";
import { openRegistrationForm } from "../../steps/openRegistrationForm.ts";
import { registerWithCode } from "../../steps/registerWithCode.ts";

const RECOVERY_FILE_NAME = /^citadel-codes-de-secours-\d{4}-\d{2}-\d{2}\.txt$/;

test.describe("Double authentification", () => {
	test("E1 : activer une application d'authentification (étape « Protège ton compte » puis profil), codes de secours montrés une fois", async ({
		page,
	}) => {
		await openRegistrationForm(page);
		await registerWithCode(page, { label: "erin" });

		await test.step("Le nom proposé est « Mon application »", async () => {
			await expect(
				page.getByRole("textbox", { name: /Nom de l.application/ }),
			).toHaveValue("Mon application");
			await page.getByRole("button", { name: "Continuer" }).click();
		});

		const secret =
			await test.step("Le QR code et la clé à saisir à la main s'affichent", async () => {
				await expect(page.getByRole("img", { name: /QR code/ })).toBeVisible();
				const key = (await page.locator("code").innerText()).trim();
				expect(key).toMatch(/^[A-Z2-7]{16,}$/);
				return key;
			});

		await test.step("Un code faux est refusé", async () => {
			await page
				.getByRole("textbox", { name: /Code de l.application/ })
				.fill("000000");
			await page.getByRole("button", { name: "Activer" }).click();
			await expect(page.getByRole("alert")).toContainText(
				"ce code n'est pas valable",
			);
		});

		await test.step("Le premier code valide active la double authentification", async () => {
			await page
				.getByRole("textbox", { name: /Code de l.application/ })
				.fill(computeTotp(secret));
			await page.getByRole("button", { name: "Activer" }).click();
			await expect(
				page.getByRole("heading", { name: "Tes codes de secours" }),
			).toBeVisible();
		});

		const codes =
			await test.step("10 codes de secours sont montrés, « Terminé » reste inactif tant qu'ils ne sont pas sauvegardés", async () => {
				const shown = await readRecoveryCodes(page);
				expect(shown, "10 codes de deux groupes de 5").toHaveLength(10);
				await expect(
					page.getByRole("button", { name: "Terminé" }),
				).toBeDisabled();
				return shown;
			});

		await test.step("Le téléchargement donne le bon fichier et débloque « Terminé »", async () => {
			const downloadPromise = page.waitForEvent("download");
			await page.getByRole("button", { name: "Télécharger en texte" }).click();
			const download = await downloadPromise;
			expect(download.suggestedFilename()).toMatch(RECOVERY_FILE_NAME);
			const filePath = await download.path();
			const content = await readFile(filePath, "utf8");
			for (const code of codes) expect(content).toContain(code);
			await expect(page.getByRole("button", { name: "Terminé" })).toBeEnabled();
		});

		await test.step("« Terminé » quitte l'étape, connecté", async () => {
			await page.getByRole("button", { name: "Terminé" }).click();
			await expect(
				page.getByRole("heading", { name: "Protège ton compte" }),
			).toBeHidden();
		});

		await test.step("Depuis le profil : la liste montre l'application, les codes de secours ne reviennent pas", async () => {
			await openProfile(page);
			await expect(
				page.getByRole("heading", { name: "Tes codes de secours" }),
			).toBeHidden();
			await expect(
				page.getByText("Mon application", { exact: true }),
			).toBeVisible();
			await expect(
				page.getByText("10 codes de secours utilisables"),
			).toBeVisible();
			await page.reload();
			await expect(
				page.getByRole("heading", { name: "Tes codes de secours" }),
			).toBeHidden();
		});

		await test.step("« Plus tard » avant l'activation ne crée rien dans la liste", async () => {
			await page
				.getByRole("button", { name: "Ajouter une application" })
				.click();
			await page
				.getByRole("textbox", { name: /Nom de l.application/ })
				.fill("Téléphone");
			await page.getByRole("button", { name: "Continuer" }).click();
			await expect(page.getByRole("img", { name: /QR code/ })).toBeVisible();
			await page.getByRole("button", { name: "Plus tard" }).click();
			await expect(page.getByText("Téléphone", { exact: true })).toBeHidden();
			await expect(page.getByRole("button", { name: /^Retirer / })).toHaveCount(
				1,
			);
		});

		await test.step("Le secret n'est dans aucune réponse suivante", async () => {
			const answer = await callApi(page, {
				method: "GET",
				path: ApiPathEnum.AUTH_FACTORS,
			});
			expect(answer.status).toBe(200);
			expect(JSON.stringify(answer.data)).not.toContain(secret);
		});
	});
});
