import { expect, type Page } from "@playwright/test";

import { openProfileCategory } from "./openProfileCategory.ts";
import type { ProfileCategoryName } from "./profileCategoryName.type.ts";

/**
 * Ouvre « Mon profil » par l'icône du compte (header de la homepage, barre du Backlog ou de GDC) et attend la page,
 * ouverte sur « Identité ». Avec `category`, passe ensuite à cette catégorie par le menu du profil
 */
export async function openProfile(
	page: Page,
	category?: ProfileCategoryName,
): Promise<void> {
	await page.getByRole("link", { name: /^Mon profil/ }).click();
	await expect(
		page.getByRole("heading", { level: 1, name: "Votre profil" }),
	).toBeVisible();
	if (category !== undefined) await openProfileCategory(page, category);
}
