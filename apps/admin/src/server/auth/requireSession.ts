import type { NextFunction, Request, Response } from "express";

import { HttpError } from "../http/HttpError.ts";
import { readCookie } from "./readCookie.ts";
import { SESSION_COOKIE_NAME } from "./sessionCookieName.ts";
import { sessionStore } from "./sessionStore.ts";

// Toute l'API, sauf la connexion, exige le cookie de session : contourner le formulaire
// du front ne donne donc rien
export function requireSession(
	request: Request,
	_response: Response,
	next: NextFunction,
): void {
	const token = readCookie(request.headers.cookie, SESSION_COOKIE_NAME);
	if (!sessionStore.isValid(token))
		throw new HttpError(401, "Connexion requise");
	next();
}
