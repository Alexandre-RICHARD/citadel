/* eslint-disable no-await-in-loop -- les étapes d'un scénario s'enchaînent dans l'ordre : chaque tour attend le précédent */
import { expect, type Page, test } from "@playwright/test";

import { E2EUrlEnum } from "../../dictionaries/e2eUrl.enum.ts";
import { openInNewTab } from "../../helpers/navigation/openInNewTab.ts";
import { openSite } from "../../helpers/navigation/openSite.ts";

type FooterPageSpec = {
	linkName: string;
	path: string;
	sections: readonly string[];
};

const ABOUT: FooterPageSpec = {
	linkName: "À propos",
	path: E2EUrlEnum.FOOTER_ABOUT,
	sections: ["Le site", "La stack", "L’hébergement", "Le code source"],
};
const CONTACT: FooterPageSpec = {
	linkName: "Contact",
	path: E2EUrlEnum.FOOTER_CONTACT,
	sections: [],
};
const LEGAL_NOTICE: FooterPageSpec = {
	linkName: "Mentions légales",
	path: E2EUrlEnum.FOOTER_LEGAL_NOTICE,
	sections: [
		"Éditeur du site",
		"Hébergement",
		"Nom de domaine et réseau",
		"Propriété intellectuelle",
	],
};
const PERSONAL_DATA: FooterPageSpec = {
	linkName: "Données personnelles",
	path: E2EUrlEnum.FOOTER_PERSONAL_DATA,
	sections: [
		"Votre compte",
		"La sécurité des comptes",
		"Ce que le navigateur garde",
		"Les cookies",
		"Les polices de caractères",
		"Le formulaire de contact",
		"Les emails du site",
		"Les journaux du serveur",
		"Les sauvegardes",
		"Cloudflare",
		"Les ressources tierces",
		"Vos droits",
	],
};
const FOOTER_PAGES = [ABOUT, CONTACT, LEGAL_NOTICE, PERSONAL_DATA];

const BACKLOG_SHOWCASE = new RegExp(`${E2EUrlEnum.HOMEPAGE}/backlog$`);

/** Ouvre la page par le pied de page et vérifie son titre et ses rubriques */
async function openFooterPage(page: Page, spec: FooterPageSpec): Promise<void> {
	await page
		.getByRole("navigation", { name: "Liens du site" })
		.getByRole("link", { name: spec.linkName })
		.click();
	await expect(page).toHaveURL(new RegExp(`${spec.path}$`));
	await expect(
		page.getByRole("heading", { level: 1, name: spec.linkName }),
	).toBeVisible();
	for (const section of spec.sections)
		await expect(
			page.getByRole("heading", { level: 2, name: section }),
		).toBeVisible();
}

test.describe("Pages du pied de page", () => {
	test("L4 : À propos, Contact, Mentions légales et Données personnelles s'ouvrent du pied de page ou de leur adresse, et ramènent à la présentation d'où l'on venait", async ({
		page,
	}) => {
		await openSite(page);

		await test.step("Le pied de page montre le copyright de l'année et le lien du code source (nouvel onglet)", async () => {
			await expect(
				page.getByText(`© ${new Date().getFullYear()} Alexandre Richard`),
			).toBeVisible();
			const gitHub = page.getByRole("link", { name: "Code source sur GitHub" });
			await expect(gitHub).toHaveAttribute("href", /^https:\/\/github\.com\//);
			await expect(gitHub).toHaveAttribute("target", "_blank");
			await expect(gitHub).toHaveAttribute("rel", /noopener/);
		});

		await test.step("Une présentation est sélectionnée : « Projets » y revient depuis À propos", async () => {
			await page
				.getByRole("navigation", { name: "Projets" })
				.getByRole("button", { name: "Backlog" })
				.click();
			await expect(page).toHaveURL(BACKLOG_SHOWCASE);
			await openFooterPage(page, ABOUT);
			await page.getByRole("link", { name: "Projets" }).click();
			await expect(page).toHaveURL(BACKLOG_SHOWCASE);
		});

		await test.step("À propos : les liens externes s'ouvrent dans un nouvel onglet", async () => {
			await openFooterPage(page, ABOUT);
			const external = page
				.getByRole("article")
				.getByRole("link", { name: /sur GitHub/ });
			await expect(external).toHaveAttribute("target", "_blank");
			await expect(external).toHaveAttribute("rel", /noopener/);
			await page.getByRole("link", { name: "Fermer la page" }).click();
			await expect(page).toHaveURL(BACKLOG_SHOWCASE);
		});

		await test.step("Mentions légales : l'adresse de contact est un lien mailto ; la croix revient à la présentation", async () => {
			await openFooterPage(page, LEGAL_NOTICE);
			await expect(
				page.locator('a[href^="mailto:contact@"]').first(),
			).toBeVisible();
			await page.getByRole("link", { name: "Fermer la page" }).click();
			await expect(page).toHaveURL(BACKLOG_SHOWCASE);
		});

		await test.step("Données personnelles : Échap revient à la présentation", async () => {
			await openFooterPage(page, PERSONAL_DATA);
			await page.keyboard.press("Escape");
			await expect(page).toHaveURL(BACKLOG_SHOWCASE);
		});

		await test.step("Contact : Échap ne ferme pas la page pendant une saisie, mais la ferme sinon", async () => {
			await openFooterPage(page, CONTACT);
			const subject = page.getByRole("textbox", { name: /Sujet/ });
			await subject.fill("Un sujet en cours de saisie");
			await subject.press("Escape");
			await expect(page).toHaveURL(new RegExp(`${E2EUrlEnum.FOOTER_CONTACT}$`));
			await expect(subject).toHaveValue("Un sujet en cours de saisie");
			await subject.blur();
			await page.keyboard.press("Escape");
			await expect(page).toHaveURL(BACKLOG_SHOWCASE);
		});

		await test.step("Chaque page s'ouvre aussi par son adresse directe, et « Projets » mène alors à l'accueil", async () => {
			for (const spec of FOOTER_PAGES) {
				const tab = await openInNewTab(page, spec.path);
				await expect(
					tab.getByRole("heading", { level: 1, name: spec.linkName }),
				).toBeVisible();
				for (const section of spec.sections)
					await expect(
						tab.getByRole("heading", { level: 2, name: section }),
					).toBeVisible();
				await tab.getByRole("link", { name: "Projets" }).click();
				await expect(tab).toHaveURL(new RegExp(`${E2EUrlEnum.HOMEPAGE}/?$`));
				await tab.close();
			}
		});
	});
});
