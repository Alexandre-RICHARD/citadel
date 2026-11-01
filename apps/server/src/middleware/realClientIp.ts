import type { NextFunction, Request, Response } from "express";

import { resolveClientIp } from "./resolveClientIp.ts";

// `request.ip` devient l'IP du visiteur, lue dans le seul X-Real-IP posé par Caddy (jamais X-Forwarded-For, qu'un
// visiteur peut écrire lui-même). Express la calcule par un getter sur le prototype : une propriété propre le masque
export function realClientIp(
	request: Request,
	_response: Response,
	next: NextFunction,
): void {
	Object.defineProperty(request, "ip", {
		value: resolveClientIp(
			request.get("X-Real-IP"),
			request.socket.remoteAddress,
		),
		enumerable: true,
	});
	next();
}
