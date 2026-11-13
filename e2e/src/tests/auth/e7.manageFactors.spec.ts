import { expect, test } from "@playwright/test";

import { countMailsWithSubject } from "../../helpers/mail/countMailsWithSubject.ts";
import { waitForMailWithSubject } from "../../helpers/mail/waitForMailWithSubject.ts";
import { backToCitadelFromAuth } from "../../helpers/navigation/backToCitadelFromAuth.ts";
import { openProfile } from "../../helpers/navigation/openProfile.ts";
import { factorRow } from "../../helpers/profile/factorRow.ts";
import { computeTotp } from "../../helpers/totp/computeTotp.ts";
import { waitForSafeTotpWindow } from "../../helpers/totp/waitForSafeTotpWindow.ts";
import { createAccountWithTotp } from "../../steps/createAccountWithTotp.ts";
import { enableEmailFactor } from "../../steps/enableEmailFactor.ts";
import { enableTotp } from "../../steps/enableTotp.ts";
import { fillLoginForm } from "../../steps/fillLoginForm.ts";
import { logOut } from "../../steps/logOut.ts";
import { openLoginForm } from "../../steps/openLoginForm.ts";
import { removeFactor } from "../../steps/removeFactor.ts";
import { submitSecondFactor } from "../../steps/submitSecondFactor.ts";

const ADDED_NOTICE = "Une double authentification a été ajoutée";
const REMOVED_NOTICE = "Une double authentification a été retirée";

test.describe("Double authentification", () => {
	test("E7 : gérer ses facteurs (deux applications nommées et le code par email), les retirer avec le mot de passe, jusqu'à plus aucune protection", async ({
		page,
	}) => {
		await waitForSafeTotpWindow();
		const { identity, secret } = await createAccountWithTotp(page, "ivan");
		const addedBefore = await countMailsWithSubject(
			identity.email,
			ADDED_NOTICE,
		);
		const removedBefore = await countMailsWithSubject(
			identity.email,
			REMOVED_NOTICE,
		);

		await openProfile(page, "Sécurité");

		await test.step("Ajouter une seconde application, « Téléphone », puis le code par email", async () => {
			await enableTotp(page, { name: "Téléphone", givesRecoveryCodes: false });
			await enableEmailFactor(page, identity.email);
		});

		await test.step("La liste montre les trois facteurs, leur type, leur date d'ajout, jamais utilisés", async () => {
			const first = factorRow(page, "Mon application");
			await expect(first).toContainText("Application d’authentification");
			await expect(first).toContainText(/Ajouté le .* · jamais utilisé/);
			const second = factorRow(page, "Téléphone");
			await expect(second).toContainText("Application d’authentification");
			await expect(second).toContainText(/Ajouté le .* · jamais utilisé/);
			await expect(
				page.getByRole("listitem").filter({ hasText: "Code par email" }),
			).toContainText(/Ajouté le .* · jamais utilisé/);
		});

		await test.step("« Activer le code par email » a disparu une fois le facteur actif", async () => {
			await expect(
				page.getByRole("button", { name: "Activer le code par email" }),
			).toHaveCount(0);
		});

		await test.step("Un facteur utilisé à la connexion affiche sa date d'usage", async () => {
			await backToCitadelFromAuth(page);
			await logOut(page);
			await openLoginForm(page);
			await fillLoginForm(page, {
				identifier: identity.email,
				password: identity.password,
			});
			await submitSecondFactor(page, computeTotp(secret, 1), "accepted");
			await openProfile(page, "Sécurité");
			await expect(factorRow(page, "Mon application")).toContainText(
				/utilisé le \d{1,2} \S+ \d{4}/,
			);
			await expect(factorRow(page, "Téléphone")).toContainText(
				"jamais utilisé",
			);
		});

		await test.step("Les ajouts ont été notifiés par mail", async () => {
			await waitForMailWithSubject(identity.email, ADDED_NOTICE, {
				alreadyReceived: addedBefore,
			});
		});

		await removeFactor(page, "Téléphone", identity.password, {
			wrongFirst: true,
		});
		await removeFactor(page, "Code par email", identity.password);

		await test.step("Les retraits ont été notifiés par mail", async () => {
			await waitForMailWithSubject(identity.email, REMOVED_NOTICE, {
				alreadyReceived: removedBefore,
			});
		});

		await test.step("Les codes de secours existent tant qu'il reste un facteur", async () => {
			await expect(
				page.getByText(/codes? de secours utilisables?\./),
			).toBeVisible();
		});

		await removeFactor(page, "Mon application", identity.password);

		await test.step("Le dernier retrait désactive la double authentification et efface les codes de secours", async () => {
			await expect(
				page.getByText(
					"Aucune double authentification : ton compte n’est protégé que par son mot de passe.",
				),
			).toBeVisible();
			await expect(page.getByText("Codes de secours")).toHaveCount(0);
		});

		await test.step("La connexion n'a plus de second facteur", async () => {
			await backToCitadelFromAuth(page);
			await logOut(page);
			await openLoginForm(page);
			await fillLoginForm(page, {
				identifier: identity.email,
				password: identity.password,
			});
			await expect(
				page.getByRole("button", { name: "Se déconnecter" }),
			).toBeVisible();
		});
	});
});
