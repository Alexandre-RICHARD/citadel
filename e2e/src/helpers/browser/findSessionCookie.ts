import type { BrowserContext, Cookie } from "@playwright/test";

/**
 * Le cookie de session du site (`citadel_session`, ou `__Host-citadel_session` quand le HTTPS est exigé), ou undefined
 * sans session. `expires` vaut -1 pour un cookie qui meurt avec le navigateur
 */
export async function findSessionCookie(
	context: BrowserContext,
): Promise<Cookie | undefined> {
	const cookies = await context.cookies();
	return cookies.find((cookie) => cookie.name.endsWith("citadel_session"));
}
