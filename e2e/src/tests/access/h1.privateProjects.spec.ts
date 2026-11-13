/* eslint-disable no-await-in-loop -- les étapes d'un scénario s'enchaînent dans l'ordre : chaque tour attend le précédent */
import { expect, test } from "@playwright/test";

import { E2EUrlEnum } from "../../dictionaries/e2eUrl.enum.ts";
import { backToCitadel } from "../../helpers/navigation/backToCitadel.ts";
import { openInNewTab } from "../../helpers/navigation/openInNewTab.ts";
import { openProfileCategory } from "../../helpers/navigation/openProfileCategory.ts";
import { openProjectFromHomepage } from "../../helpers/navigation/openProjectFromHomepage.ts";
import { createConnectedAccount } from "../../steps/createConnectedAccount.ts";
import { logIn } from "../../steps/logIn.ts";
import { logOut } from "../../steps/logOut.ts";

/** L'adresse de connexion attendue pour revenir à `path` */
function loginUrlFor(path: string): RegExp {
	return new RegExp(
		`${E2EUrlEnum.AUTH_LOGIN}\\?redirect=${encodeURIComponent(path)}$`,
	);
}

test.describe("Accès aux projets", () => {
	test("H1 : Game Death Counter, Backlog et le profil exigent la connexion et y ramènent ; Homepage, Satisfactory et Angers Irigo restent publics", async ({
		page,
	}) => {
		const identity = await createConnectedAccount(page, "quentin");
		await logOut(page);

		for (const { project, path } of [
			{ project: "Backlog", path: E2EUrlEnum.BACKLOG },
			{ project: "Game Death Counter", path: E2EUrlEnum.GAME_DEATH_COUNTER },
		]) {
			await test.step(`« Y accéder » de ${project}, déconnecté : la connexion, puis retour à ${path}`, async () => {
				await openProjectFromHomepage(page, project);
				await expect(page).toHaveURL(loginUrlFor(path));
				await logIn(page, identity);
				await expect(page).toHaveURL(new RegExp(`${path}$`));
				await backToCitadel(page);
				await logOut(page);
			});
		}

		await test.step("Le profil, ouvert directement dans un nouvel onglet : la connexion, puis retour au profil", async () => {
			const tab = await openInNewTab(page, E2EUrlEnum.AUTH_PROFILE);
			await expect(tab).toHaveURL(loginUrlFor(E2EUrlEnum.AUTH_PROFILE));
			await logIn(tab, identity);
			await expect(tab).toHaveURL(
				new RegExp(`${E2EUrlEnum.AUTH_PROFILE_IDENTITY}$`),
			);
			await expect(
				tab.getByRole("heading", { level: 1, name: "Votre profil" }),
			).toBeVisible();
			await openProfileCategory(tab, "Connexion");
			// Sa session est celle du navigateur : on la ferme pour que la suite repasse en visiteur
			await tab.getByRole("button", { name: "Me déconnecter" }).click();
			await tab.close();
		});

		await test.step("Un projet privé ouvert directement dans un nouvel onglet (favori) : la connexion aussi", async () => {
			const tab = await openInNewTab(page, E2EUrlEnum.BACKLOG);
			await expect(tab).toHaveURL(loginUrlFor(E2EUrlEnum.BACKLOG));
			await tab.close();
		});

		for (const { project, path } of [
			{ project: "Satisfactory", path: E2EUrlEnum.SATISFACTORY },
			{ project: "Angers Irigo", path: E2EUrlEnum.IRIGO },
		]) {
			await test.step(`${project} s'ouvre sans compte`, async () => {
				await openProjectFromHomepage(page, project);
				await expect(page).toHaveURL(new RegExp(`${path}`));
				await expect(page).not.toHaveURL(/\/auth\//);
				await page.goBack();
				await expect(
					page.getByRole("navigation", { name: "Projets" }),
				).toBeVisible();
			});
		}
	});
});
