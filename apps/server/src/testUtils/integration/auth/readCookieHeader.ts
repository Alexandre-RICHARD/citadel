import type { Response } from "supertest";

import { readSetCookie } from "./readSetCookie.ts";

// Le cookie que la réponse vient de poser, prêt pour l'en-tête Cookie de la requête suivante ; undefined sans cookie
export function readCookieHeader(
	response: Response,
	cookieName: string,
): string | undefined {
	return readSetCookie(response, cookieName)?.split(";")[0];
}
