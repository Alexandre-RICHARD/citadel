import type { Page } from "@playwright/test";

// Un code de secours affiché : deux groupes de 5 caractères
const RECOVERY_CODE_PATTERN = /^[A-Z0-9]{5}-[A-Z0-9]{5}$/;

/** Les codes de secours que le panneau « Vos codes de secours » affiche en ce moment */
export async function readRecoveryCodes(page: Page): Promise<string[]> {
	const texts = await page.getByRole("listitem").allTextContents();
	return texts
		.map((text) => text.trim())
		.filter((text) => RECOVERY_CODE_PATTERN.test(text));
}
