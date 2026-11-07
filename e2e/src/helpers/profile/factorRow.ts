import type { Locator, Page } from "@playwright/test";

/** Dans la liste de la section « Double authentification » du profil : la ligne du facteur de ce nom */
export function factorRow(page: Page, name: string): Locator {
	return page.getByRole("listitem").filter({ hasText: name });
}
