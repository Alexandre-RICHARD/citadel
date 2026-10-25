import { type Request, type Response, Router } from "express";
import { z } from "zod";

import type { SessionInfo } from "../../shared/sessionInfo.type.ts";
import { env } from "../configuration/env.ts";
import { HttpError } from "../http/HttpError.ts";
import { writeAuditLog } from "../http/writeAuditLog.ts";
import { loginThrottle } from "./loginThrottle.ts";
import { readCookie } from "./readCookie.ts";
import { requireSession } from "./requireSession.ts";
import { SESSION_COOKIE_NAME } from "./sessionCookieName.ts";
import { sessionStore } from "./sessionStore.ts";
import { verifyPassword } from "./verifyPassword.ts";

const loginBodySchema = z.object({ password: z.string().min(1).max(200) });

// HttpOnly : illisible par JavaScript ; SameSite=Strict : jamais envoyé depuis un autre
// site ; Secure seulement en HTTPS, sinon le navigateur ne le renverrait pas (console en
// HTTP sur le LAN, §12.1)
function setSessionCookie(
	request: Request,
	response: Response,
	token: string,
): void {
	response.cookie(SESSION_COOKIE_NAME, token, {
		httpOnly: true,
		sameSite: "strict",
		secure: request.secure,
		path: "/",
		maxAge: sessionStore.durationMs,
	});
}

export const authRouter = Router();

authRouter.post("/api/login", (request, response) => {
	const ip = request.ip ?? "inconnue";
	loginThrottle.assertAllowed(ip);

	const body = loginBodySchema.safeParse(request.body);
	if (
		!body.success ||
		!verifyPassword(body.data.password, env.ADMIN_PASSWORD_HASH)
	) {
		loginThrottle.recordFailure(ip);
		writeAuditLog({ event: "login", result: "refusé", ip });
		throw new HttpError(401, "Mot de passe incorrect");
	}

	loginThrottle.recordSuccess(ip);
	writeAuditLog({ event: "login", result: "ok", ip });
	setSessionCookie(request, response, sessionStore.create());
	response.status(204).end();
});

authRouter.post("/api/logout", (request, response) => {
	sessionStore.delete(readCookie(request.headers.cookie, SESSION_COOKIE_NAME));
	response.clearCookie(SESSION_COOKIE_NAME, { path: "/" });
	response.status(204).end();
});

authRouter.get(
	"/api/session",
	requireSession,
	(_request, response: Response<SessionInfo>) => {
		response.json({ consoleVersion: env.APP_VERSION });
	},
);
