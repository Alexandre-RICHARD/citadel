import type { NextFunction, Request, Response } from "express";

// En-têtes de sécurité de chaque réponse : la console ne charge que ses propres fichiers,
// ne s'affiche pas dans une autre page, et n'envoie pas son adresse aux liens suivis.
// 'unsafe-inline' pour les styles : le thème passe par des attributs style (ThemeProvider).
export function securityHeaders(
	_request: Request,
	response: Response,
	next: NextFunction,
): void {
	response.setHeader(
		"Content-Security-Policy",
		"default-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; frame-ancestors 'none'; base-uri 'none'; form-action 'self'",
	);
	response.setHeader("X-Content-Type-Options", "nosniff");
	response.setHeader("X-Frame-Options", "DENY");
	response.setHeader("Referrer-Policy", "no-referrer");
	next();
}
