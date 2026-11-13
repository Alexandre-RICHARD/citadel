/* eslint-disable no-await-in-loop -- les étapes d'un scénario s'enchaînent dans l'ordre : chaque tour attend le précédent */
import { expect, type Page, test } from "@playwright/test";

import type { Identity } from "../../helpers/identity/identity.type.ts";
import { backToCitadelFromAuth } from "../../helpers/navigation/backToCitadelFromAuth.ts";
import { openProfile } from "../../helpers/navigation/openProfile.ts";
import { chooseSecondFactorMethod } from "../../steps/chooseSecondFactorMethod.ts";
import { createAccountWithTotp } from "../../steps/createAccountWithTotp.ts";
import { fillLoginForm } from "../../steps/fillLoginForm.ts";
import { logOut } from "../../steps/logOut.ts";
import { openLoginForm } from "../../steps/openLoginForm.ts";
import { regenerateRecoveryCodes } from "../../steps/regenerateRecoveryCodes.ts";
import { submitSecondFactor } from "../../steps/submitSecondFactor.ts";

// Un code de secours se recopie comme on peut : tel quel, en minuscules, sans tiret, avec un espace à la place
const WRITINGS: readonly ((code: string) => string)[] = [
	(code) => code,
	(code) => code.toLowerCase(),
	(code) => code.replace("-", ""),
	(code) => code.replace("-", " ").toLowerCase(),
];

/** Part de la homepage, connecté : se déconnecte, puis arrive à l'étape « Code de secours » de la connexion */
async function reachRecoveryCodeStep(
	page: Page,
	identity: Identity,
): Promise<void> {
	await logOut(page);
	await openLoginForm(page);
	await fillLoginForm(page, {
		identifier: identity.email,
		password: identity.password,
	});
	await chooseSecondFactorMethod(page, "Code de secours");
}

async function expectRemainingCodes(page: Page, text: string): Promise<void> {
	await openProfile(page, "Sécurité");
	await expect(page.getByText(text)).toBeVisible();
	await backToCitadelFromAuth(page);
}

test.describe("Double authentification", () => {
	test("E6 : chaque code de secours marche une fois, sous plusieurs écritures ; le décompte est juste ; refaire les codes invalide les anciens", async ({
		page,
	}) => {
		test.setTimeout(150_000);
		const { identity, recoveryCodes } = await createAccountWithTotp(
			page,
			"heidi",
		);

		await test.step("Dix codes utilisables au départ", async () => {
			await expectRemainingCodes(page, "10 codes de secours utilisables");
		});

		await test.step("Un code de secours ouvre la session ; le même code ensuite est refusé", async () => {
			await reachRecoveryCodeStep(page, identity);
			await submitSecondFactor(page, recoveryCodes[0], "accepted");
			await expect(
				page.getByRole("button", { name: "Se déconnecter" }),
			).toBeVisible();

			await reachRecoveryCodeStep(page, identity);
			await submitSecondFactor(page, recoveryCodes[0], "refused");
			// Un autre code passe sur la même étape : le refus n'a pas fermé le parcours
			await submitSecondFactor(page, recoveryCodes[1], "accepted");
		});

		await test.step("Huit codes restent utilisables", async () => {
			await expectRemainingCodes(page, "8 codes de secours utilisables");
		});

		const newCodes =
			await test.step("Refaire les codes : dix nouveaux", async () => {
				await openProfile(page, "Sécurité");
				const codes = await regenerateRecoveryCodes(page, identity.password);
				await expect(
					page.getByText("10 codes de secours utilisables"),
				).toBeVisible();
				await backToCitadelFromAuth(page);
				return codes;
			});

		await test.step("Un ancien code encore intact est refusé, un nouveau est accepté", async () => {
			await reachRecoveryCodeStep(page, identity);
			await submitSecondFactor(page, recoveryCodes[5], "refused");
			await submitSecondFactor(page, newCodes[0], "accepted");
		});

		await test.step("Huit autres nouveaux codes, en minuscules, sans tiret ou avec un espace : acceptés", async () => {
			for (const [index, code] of newCodes.slice(1, 9).entries()) {
				await reachRecoveryCodeStep(page, identity);
				const write = WRITINGS[(index + 1) % WRITINGS.length];
				await submitSecondFactor(page, write(code), "accepted");
			}
		});

		await test.step("Un seul code restant, au singulier", async () => {
			await expectRemainingCodes(page, "1 code de secours utilisable.");
		});

		await test.step("Le dernier code utilisé : le profil dit qu'il faut en refaire", async () => {
			await reachRecoveryCodeStep(page, identity);
			await submitSecondFactor(page, newCodes[9], "accepted");
			await expectRemainingCodes(
				page,
				"Aucun code de secours utilisable : refais-en.",
			);
		});
	});
});
