import type { NextFunction, Request, Response } from "express";

import { HttpError } from "../http/HttpError.ts";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

function hostOf(origin: string | undefined): string | null {
	if (origin === undefined) return null;
	try {
		return new URL(origin).host;
	} catch {
		return null;
	}
}

// Protection CSRF : une action (POST) doit venir d'une page de la console elle-même. Un
// autre site ouvert dans ton navigateur ne peut donc pas arrêter un service à ta place.
// Le cookie SameSite=Strict protège déjà ; ceci est la deuxième barrière.
export function requireSameOrigin(
	request: Request,
	_response: Response,
	next: NextFunction,
): void {
	if (
		!SAFE_METHODS.has(request.method) &&
		hostOf(request.headers.origin) !== request.headers.host
	)
		throw new HttpError(
			403,
			"Requête refusée : elle ne vient pas de la console",
		);
	next();
}
