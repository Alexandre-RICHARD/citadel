import type { Browser, BrowserContext, Page } from "@playwright/test";
import { test } from "@playwright/test";

import { openOtherBrowser } from "../helpers/browser/openOtherBrowser.ts";
import type { Identity } from "../helpers/identity/identity.type.ts";
import { logIn } from "./logIn.ts";
import { openLoginForm } from "./openLoginForm.ts";

type OtherBrowser = { context: BrowserContext; page: Page };

/**
 * Le même utilisateur se connecte depuis un autre appareil (un second navigateur, sans rien de commun avec le premier) :
 * une seconde session s'ouvre sur son compte. Termine sur la homepage de ce navigateur, connecté. Le scénario referme le
 * contexte renvoyé s'il le souhaite (`userAgent` : le navigateur dont il se réclame) (Playwright le fait de toute façon en fin de test)
 */
export async function signInOnOtherBrowser(
	browser: Browser,
	identity: Identity,
	{ userAgent }: { userAgent?: string } = {},
): Promise<OtherBrowser> {
	return test.step("Se connecter depuis un autre navigateur", async () => {
		const context = await openOtherBrowser(browser, {
			...(userAgent !== undefined && { userAgent }),
		});
		const page = await context.newPage();
		await openLoginForm(page);
		await logIn(page, identity);
		return { context, page };
	});
}
