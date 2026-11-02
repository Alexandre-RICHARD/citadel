import { AuthErrorCodeEnum } from "@citadel/specs/src/projects/auth/error/authErrorCode.enum.ts";
import type { NextFunction, Request, Response } from "express";

import { requestSessions } from "../common/routing/requestSessions.ts";
import { UnauthorizedError } from "../error/UnauthorizedError.ts";
import { sessionCookie } from "../projects/auth/cookie/sessionCookie.ts";
import { sessionService } from "../projects/auth/service/sessionService.ts";

/**
 * Devant chaque endpoint protégé (placé par le routeur typé) : sans session valide, 401 AUTHENTICATION_REQUIRED, avant
 * toute validation. Une session « se souvenir de moi » prolongée renvoie son cookie avec sa nouvelle durée
 */
export async function requireSession(
	request: Request,
	response: Response,
	next: NextFunction,
): Promise<void> {
	const token = sessionCookie.read(request);
	const session =
		token === undefined ? null : await sessionService.authenticate(token);
	if (token === undefined || session === null)
		throw new UnauthorizedError(
			AuthErrorCodeEnum.AUTHENTICATION_REQUIRED,
			"A valid session is required",
		);

	if (session.isProlonged && session.remember)
		sessionCookie.set(response, {
			token,
			remember: true,
			expiresAt: session.expiresAt,
		});
	requestSessions.attach(request, session);
	next();
}
