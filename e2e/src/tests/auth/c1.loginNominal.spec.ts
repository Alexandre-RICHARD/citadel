import { expect, test } from "@playwright/test";

import { E2EUrlEnum } from "../../dictionaries/e2eUrl.enum.ts";
import { findSessionCookie } from "../../helpers/browser/findSessionCookie.ts";
import { backToCitadel } from "../../helpers/navigation/backToCitadel.ts";
import { openInNewTab } from "../../helpers/navigation/openInNewTab.ts";
import { openProjectFromHomepage } from "../../helpers/navigation/openProjectFromHomepage.ts";
import { createConnectedAccount } from "../../steps/createConnectedAccount.ts";
import { logIn } from "../../steps/logIn.ts";
import { logOut } from "../../steps/logOut.ts";
import { openLoginForm } from "../../steps/openLoginForm.ts";

const SEVEN_DAYS_S = 7 * 24 * 60 * 60;

test.describe("Connexion", () => {
	test("C1 : se connecter par email puis par pseudo, revenir à la page demandée (ou au profil), durée du cookie selon « Se souvenir de moi »", async ({
		page,
	}) => {
		const identity = await createConnectedAccount(page, "carol");
		await logOut(page);

		await test.step("Depuis le Backlog, déconnecté : renvoyé à la connexion", async () => {
			await openProjectFromHomepage(page, "Backlog");
			await expect(
				page.getByRole("heading", { name: "Se connecter" }),
			).toBeVisible();
		});

		await test.step("Le formulaire garde l'identifiant au rechargement, jamais le mot de passe", async () => {
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

		// Connexion par email, sans « Se souvenir de moi »
		await logIn(page, identity);

		await test.step("La page demandée (le Backlog) s'ouvre, la session est un cookie de navigateur (sans durée)", async () => {
			await expect(page).toHaveURL(new RegExp(`${E2EUrlEnum.BACKLOG}$`));
			const cookie = await findSessionCookie(page.context());
			expect(cookie, "cookie de session").toBeDefined();
			expect(cookie?.expires, "cookie de session sans Max-Age").toBe(-1);
		});

		await backToCitadel(page);
		await logOut(page);
		await openLoginForm(page);

		await test.step("Connexion par pseudo avec « Se souvenir de moi » : retour à la homepage, cookie de 7 jours", async () => {
			await logIn(page, identity, {
				identifier: identity.username,
				remember: true,
			});
			await expect(
				page.getByRole("button", { name: "Se déconnecter" }),
			).toBeVisible();
			const cookie = await findSessionCookie(page.context());
			expect(cookie, "cookie de session").toBeDefined();
			const remainingS = (cookie?.expires ?? 0) - Date.now() / 1000;
			expect(remainingS, "durée du cookie, en secondes").toBeGreaterThan(
				SEVEN_DAYS_S - 120,
			);
			expect(remainingS).toBeLessThanOrEqual(SEVEN_DAYS_S + 5);
		});

		await logOut(page);

		await test.step("Sans page demandée (/auth/login ouvert directement), la connexion mène au profil", async () => {
			const tab = await openInNewTab(page, E2EUrlEnum.AUTH_LOGIN);
			await logIn(tab, identity);
			await expect(tab).toHaveURL(
				new RegExp(`${E2EUrlEnum.AUTH_PROFILE_IDENTITY}$`),
			);
		});
	});
});
