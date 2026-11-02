import { classifyRequestOrigin } from "@citadel/common/src/universal/http/classifyRequestOrigin.ts";
import { RequestOriginEnum } from "@citadel/common/src/universal/http/requestOrigin.enum.ts";
import type { NextFunction, Request, Response } from "express";

import { HttpError } from "../http/HttpError.ts";

const ACCEPTED_ORIGINS = new Set([
	RequestOriginEnum.SAFE_METHOD,
	RequestOriginEnum.SAME_HOST,
]);

// Protection CSRF : une action (POST) doit venir d'une page de la console elle-même. Un
// autre site ouvert dans ton navigateur ne peut donc pas arrêter un service à ta place.
// Le cookie SameSite=Strict protège déjà ; ceci est la deuxième barrière. Sans en-tête
// Origin, refusée aussi : personne d'autre que le navigateur n'appelle la console.
export function requireSameOrigin(
	request: Request,
	_response: Response,
	next: NextFunction,
): void {
	const origin = classifyRequestOrigin({
		method: request.method,
		origin: request.headers.origin,
		host: request.headers.host,
	});
	if (!ACCEPTED_ORIGINS.has(origin))
		throw new HttpError(
			403,
			"Requête refusée : elle ne vient pas de la console",
		);
	next();
}
