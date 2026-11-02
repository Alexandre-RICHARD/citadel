import { readCookieValue } from "@citadel/common/src/universal/cookie/readCookieValue.ts";
import type { Request, Response } from "express";

import { authSettings } from "../../../configuration/authSettings.ts";
import type { SessionCookieBean } from "../bean/sessionCookieBean.type.ts";
import { buildAuthCookieOptions } from "./buildAuthCookieOptions.ts";
import { buildCookieName } from "./buildCookieName.ts";

const SESSION_COOKIE_NAME = buildCookieName(
	"citadel_session",
	authSettings.isCookieSecure,
);

// Le cookie qui porte le jeton de session
export const sessionCookie = {
	name: SESSION_COOKIE_NAME,

	// Undefined sans cookie ; un cookie vide ne vaut rien non plus
	read(request: Pick<Request, "headers">): string | undefined {
		const token = readCookieValue(request.headers.cookie, SESSION_COOKIE_NAME);
		return token === "" ? undefined : token;
	},

	// Avec « se souvenir de moi », il dure jusqu'à la fin de la session ; sans, jusqu'à la fermeture du navigateur
	set(
		response: Pick<Response, "cookie">,
		{ token, remember, expiresAt }: SessionCookieBean,
	) {
		response.cookie(
			SESSION_COOKIE_NAME,
			token,
			buildAuthCookieOptions(
				authSettings.isCookieSecure,
				remember ? expiresAt.getTime() - Date.now() : null,
			),
		);
	},

	// Mêmes attributs qu'à la pose : sinon le navigateur refuse d'effacer un cookie __Host-
	clear(response: Pick<Response, "clearCookie">): void {
		response.clearCookie(
			SESSION_COOKIE_NAME,
			buildAuthCookieOptions(authSettings.isCookieSecure, null),
		);
	},
};
