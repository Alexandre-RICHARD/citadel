import type { Response } from "supertest";

// L'en-tête Set-Cookie posé pour ce cookie par une réponse ; undefined si la réponse ne le pose pas
export function readSetCookie(
	response: Response,
	cookieName: string,
): string | undefined {
	const setCookies: unknown = response.headers["set-cookie"];
	if (!Array.isArray(setCookies)) return undefined;
	return setCookies.find(
		(setCookie): setCookie is string =>
			typeof setCookie === "string" && setCookie.startsWith(`${cookieName}=`),
	);
}
