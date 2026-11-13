import { expect, type Page } from "@playwright/test";

import type { ProfileCategoryName } from "./profileCategoryName.type.ts";

/** Depuis le profil déjà ouvert : passe à cette catégorie par le menu de gauche et attend le titre de sa carte */
export async function openProfileCategory(
	page: Page,
	category: ProfileCategoryName,
): Promise<void> {
	await page
		.getByRole("navigation", { name: "Catégories du profil" })
		.getByRole("link", { name: category })
		.click();
	await expect(
		page.getByRole("heading", { level: 2, name: category }),
	).toBeVisible();
}
