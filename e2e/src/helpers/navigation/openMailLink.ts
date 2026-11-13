import type { Page } from "@playwright/test";

/**
 * L'utilisateur clique le lien d'un mail : la messagerie ouvre un nouvel onglet du même navigateur (même session,
 * même cookies). Rend cet onglet, une fois la page chargée et ses premières requêtes terminées : un humain lit la page
 * avant de cliquer « Confirmer ». (Un clic dans la milliseconde qui suit l'ouverture passe avant la lecture du parcours
 * en cours et envoie l'utilisateur ailleurs que prévu : voir docs/todo/todo.md, §8.)
 */
export async function openMailLink(page: Page, link: string): Promise<Page> {
	const mailLinkPage = await page.context().newPage();
	await mailLinkPage.goto(link);
	await mailLinkPage.waitForLoadState("networkidle");
	return mailLinkPage;
}
