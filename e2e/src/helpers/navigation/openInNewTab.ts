import type { Page } from "@playwright/test";

import { E2EUrlEnum } from "../../dictionaries/e2eUrl.enum.ts";

/**
 * L'utilisateur ouvre une adresse du site dans un nouvel onglet du même navigateur (un favori, une adresse tapée, un
 * lien reçu ailleurs que dans un email) : même session, mais un onglet sans mémoire de ce qu'il a fait dans les autres
 * (le `sessionStorage` est propre à chaque onglet). `path` : un chemin du site (E2EUrlEnum). Rend le nouvel onglet
 */
export async function openInNewTab(page: Page, path: string): Promise<Page> {
	const tab = await page.context().newPage();
	await tab.goto(`${E2EUrlEnum.SITE_URL}${path}`);
	return tab;
}
