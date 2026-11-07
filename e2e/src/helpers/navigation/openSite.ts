import { expect, type Page } from "@playwright/test";

import { E2EUrlEnum } from "../../dictionaries/e2eUrl.enum.ts";

/**
 * Le point de départ de tout scénario : un visiteur qui ouvre le site à son adresse (« / », qui renvoie vers la
 * homepage). C'est le SEUL endroit, avec openMailLink, où un test écrit une adresse : ensuite, on ne fait que ce
 * qu'un utilisateur peut faire dans l'interface (liens, boutons). ESLint interdit `goto` dans src/tests.
 */
export async function openSite(page: Page): Promise<void> {
	await page.goto(E2EUrlEnum.HOME);
	await expect(page).toHaveURL(new RegExp(`${E2EUrlEnum.HOMEPAGE}/?$`));
}
