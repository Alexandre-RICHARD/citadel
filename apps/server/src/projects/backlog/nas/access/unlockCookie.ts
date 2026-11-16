import { readCookieValue } from "@citadel/common/src/universal/cookie/readCookieValue.ts";
import type { CookieOptions, Request, Response } from "express";

import { authSettings } from "../../../../configuration/authSettings.ts";
import { buildCookieName } from "../../../auth/cookie/buildCookieName.ts";

const UNLOCK_COOKIE_NAME = buildCookieName(
	"citadel_media_unlock",
	authSettings.isCookieSecure,
);

// HttpOnly, SameSite=Strict : jamais envoyé depuis un autre site. Sur l'instance locale (HTTP), sans Secure ni __Host-
function buildOptions(maxAgeMs: number | null): CookieOptions {
	return {
		httpOnly: true,
		secure: authSettings.isCookieSecure,
		sameSite: "strict",
		path: "/",
		...(maxAgeMs !== null && { maxAge: maxAgeMs }),
	};
}

/**
 * Le cookie du déverrouillage du mode connecté : il survit aux mises en veille de l'instance (sinon, il faudrait
 * redonner le mot de passe à chaque réveil) et dure 12 h
 */
export const unlockCookie = {
	name: UNLOCK_COOKIE_NAME,

	read(request: Pick<Request, "headers">): string | undefined {
		return readCookieValue(request.headers.cookie, UNLOCK_COOKIE_NAME);
	},

	set(response: Pick<Response, "cookie">, token: string, maxAgeMs: number) {
		response.cookie(UNLOCK_COOKIE_NAME, token, buildOptions(maxAgeMs));
	},

	clear(response: Pick<Response, "clearCookie">): void {
		response.clearCookie(UNLOCK_COOKIE_NAME, buildOptions(null));
	},
};
