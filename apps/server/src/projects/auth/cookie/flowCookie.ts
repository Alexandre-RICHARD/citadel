import { readCookieValue } from "@citadel/common/src/universal/cookie/readCookieValue.ts";
import type { Request, Response } from "express";

import { authSettings } from "../../../configuration/authSettings.ts";
import type { FlowCookieBean } from "../bean/flowCookieBean.type.ts";
import { buildAuthCookieOptions } from "./buildAuthCookieOptions.ts";
import { buildCookieName } from "./buildCookieName.ts";

const FLOW_COOKIE_NAME = buildCookieName(
	"citadel_flow",
	authSettings.isCookieSecure,
);

// Le cookie qui lie un parcours (inscription, connexion par mail…) au navigateur qui l'a commencé, le temps du parcours
export const flowCookie = {
	name: FLOW_COOKIE_NAME,

	// Undefined sans cookie ; un cookie vide ne vaut rien non plus
	read(request: Pick<Request, "headers">): string | undefined {
		const token = readCookieValue(request.headers.cookie, FLOW_COOKIE_NAME);
		return token === "" ? undefined : token;
	},

	set(
		response: Pick<Response, "cookie">,
		{ token, expiresAt }: FlowCookieBean,
	) {
		response.cookie(
			FLOW_COOKIE_NAME,
			token,
			buildAuthCookieOptions(
				authSettings.isCookieSecure,
				expiresAt.getTime() - Date.now(),
			),
		);
	},

	// Mêmes attributs qu'à la pose : sinon le navigateur refuse d'effacer un cookie __Host-
	clear(response: Pick<Response, "clearCookie">): void {
		response.clearCookie(
			FLOW_COOKIE_NAME,
			buildAuthCookieOptions(authSettings.isCookieSecure, null),
		);
	},
};
