import type { Browser, BrowserContext } from "@playwright/test";

import { E2EUrlEnum } from "../../dictionaries/e2eUrl.enum.ts";

/**
 * « Un autre navigateur » : ni cookies ni stockage partagés avec le premier (un autre appareil, ou un autre
 * utilisateur). Mêmes réglages que le navigateur du test (playwright.config.ts), que `browser.newContext()` ne reprend pas.
 * `userAgent` : de quel navigateur il se réclame (la liste des sessions le montre)
 */
export async function openOtherBrowser(
	browser: Browser,
	{ userAgent }: { userAgent?: string } = {},
): Promise<BrowserContext> {
	return browser.newContext({
		baseURL: E2EUrlEnum.SITE_URL,
		ignoreHTTPSErrors: true,
		locale: "fr-FR",
		timezoneId: "Europe/Paris",
		reducedMotion: "reduce",
		...(userAgent !== undefined && { userAgent }),
	});
}
