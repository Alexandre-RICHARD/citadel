import { expect, type Page } from "@playwright/test";

/** Quitte un projet par « Retour à la Citadel » et attend le header de la homepage */
export async function backToCitadel(page: Page): Promise<void> {
	await page.getByRole("button", { name: "Retour à la Citadel" }).click();
	await expect(page.getByRole("navigation", { name: "Projets" })).toBeVisible();
}
