import { expect, type Page } from "@playwright/test";

/**
 * Sur la homepage : sélectionne le projet dans la navigation (« Backlog », « Game Death Counter »…), vérifie que
 * sa présentation s'affiche, puis clique « Y accéder »
 */
export async function openProjectFromHomepage(
	page: Page,
	projectName: string,
): Promise<void> {
	await page
		.getByRole("navigation", { name: "Projets" })
		.getByRole("button", { name: projectName })
		.click();
	await expect(
		page.getByRole("heading", { level: 1, name: projectName }),
	).toBeVisible();
	await page.getByRole("link", { name: "Y accéder" }).click();
}
