import { expect, type Page, test } from "@playwright/test";

import { E2EUrlEnum } from "../../dictionaries/e2eUrl.enum.ts";
import { findSessionCookie } from "../../helpers/browser/findSessionCookie.ts";
import type { Identity } from "../../helpers/identity/identity.type.ts";
import { openProfile } from "../../helpers/navigation/openProfile.ts";
import { createConnectedAccount } from "../../steps/createConnectedAccount.ts";
import { logIn } from "../../steps/logIn.ts";
import { logOut } from "../../steps/logOut.ts";
import { openLoginForm } from "../../steps/openLoginForm.ts";
import { signInOnOtherBrowser } from "../../steps/signInOnOtherBrowser.ts";

const FIREFOX_ON_LINUX =
	"Mozilla/5.0 (X11; Linux x86_64; rv:140.0) Gecko/20100101 Firefox/140.0";

function sessionRows(page: Page) {
	return page.getByRole("listitem").filter({ hasText: "Dernière activité" });
}

function otherSessionRow(page: Page) {
	return sessionRows(page).filter({ hasNotText: "Cette session" });
}

/** L'autre navigateur reprend sa place sur la homepage et se reconnecte : une nouvelle session s'ouvre sur le compte */
async function signInAgain(otherPage: Page, identity: Identity): Promise<void> {
	await openLoginForm(otherPage);
	await logIn(otherPage, identity);
}

test.describe("Profil : sessions", () => {
	test("G5 : lister, fermer une autre session, toutes les autres, ou celle-ci ; une session déjà fermée ailleurs est signalée", async ({
		page,
		browser,
	}) => {
		const identity = await createConnectedAccount(page, "nina");
		await openProfile(page, "Connexion");

		await test.step("Une seule session : « Cette session », ses dates et son réseau, et rien à déconnecter ailleurs", async () => {
			await expect(sessionRows(page)).toHaveCount(1);
			const current = sessionRows(page).first();
			await expect(current).toContainText("Cette session");
			await expect(current).toContainText(/sur Windows/);
			await expect(current).toContainText(/Dernière activité le /);
			await expect(current).toContainText(/Ouverte le .* · fin prévue le /);
			await expect(current).toContainText(/Réseau \S+/);
			await expect(
				page.getByRole("button", { name: "Tout déconnecter sauf ici" }),
			).toBeDisabled();
		});

		const other = await signInOnOtherBrowser(browser, identity, {
			userAgent: FIREFOX_ON_LINUX,
		});

		await test.step("Une seconde session apparaît, avec le navigateur et le système de l'autre appareil", async () => {
			await page.reload();
			await expect(sessionRows(page)).toHaveCount(2);
			await expect(otherSessionRow(page)).toContainText("Firefox sur Linux");
			await expect(
				page.getByRole("button", { name: "Tout déconnecter sauf ici" }),
			).toBeEnabled();
		});

		await test.step("« Déconnecter » ferme l'autre session : cet appareil retombe sur la connexion à son prochain appel", async () => {
			await otherSessionRow(page)
				.getByRole("button", { name: "Déconnecter" })
				.click();
			await expect(sessionRows(page)).toHaveCount(1);
			await other.page.reload();
			await expect(
				other.page.getByRole("link", { name: "Se connecter" }),
			).toBeVisible();
		});

		await test.step("Une session déjà fermée ailleurs : le message le dit", async () => {
			await signInAgain(other.page, identity);
			await page.reload();
			await expect(sessionRows(page)).toHaveCount(2);
			// L'autre appareil se déconnecte pendant que la liste est affichée ici
			await logOut(other.page);
			await otherSessionRow(page)
				.getByRole("button", { name: "Déconnecter" })
				.click();
			await expect(page.getByRole("alert")).toContainText(
				"cette session n'existe plus, elle a peut-être déjà été fermée",
			);
		});

		await test.step("« Tout déconnecter sauf ici » ferme toutes les autres sessions", async () => {
			await signInAgain(other.page, identity);
			await page.reload();
			await expect(sessionRows(page)).toHaveCount(2);
			await page
				.getByRole("button", { name: "Tout déconnecter sauf ici" })
				.click();
			await expect(sessionRows(page)).toHaveCount(1);
			await expect(
				page.getByRole("button", { name: "Tout déconnecter sauf ici" }),
			).toBeDisabled();
			await other.page.reload();
			await expect(
				other.page.getByRole("link", { name: "Se connecter" }),
			).toBeVisible();
		});

		await test.step("« Me déconnecter » renvoie à la connexion et efface le cookie", async () => {
			await sessionRows(page)
				.first()
				.getByRole("button", { name: "Me déconnecter" })
				.click();
			await expect(page).toHaveURL(new RegExp(`${E2EUrlEnum.AUTH_LOGIN}`));
			expect(await findSessionCookie(page.context())).toBeUndefined();
		});

		await test.step("« Tout déconnecter » ferme aussi celle-ci : retour à la connexion, cookie effacé", async () => {
			// La connexion demandée depuis le profil y ramène
			await logIn(page, identity);
			await expect(
				page.getByRole("heading", { level: 1, name: "Ton profil" }),
			).toBeVisible();
			await page
				.getByRole("button", { name: "Tout déconnecter", exact: true })
				.click();
			await expect(page).toHaveURL(new RegExp(`${E2EUrlEnum.AUTH_LOGIN}`));
			expect(await findSessionCookie(page.context())).toBeUndefined();
		});
	});
});
