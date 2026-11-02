import type { NextFunction, Request, Response } from "express";

import { notFound } from "./notFound.ts";

// Les routes /internal ne répondent qu'aux appels directs, par le réseau Docker (la console du NAS). Caddy pose X-Real-IP
// sur toute requête venue d'Internet : celle-là reçoit la même 404 qu'une route inconnue. Le Caddyfile bloque déjà
// /api/internal ; ceci tient même si cette règle disparaît
export function internalOnly(
	request: Request,
	response: Response,
	next: NextFunction,
): void {
	if (request.get("X-Real-IP") !== undefined) {
		notFound(request, response, next);
		return;
	}
	next();
}
