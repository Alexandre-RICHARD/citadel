import type { CookieOptions } from "express";

/**
 * Attributs des cookies de l'authentification. HttpOnly : illisible par JavaScript ; SameSite=Lax : envoyé en arrivant
 * d'un lien, jamais par la requête d'un autre site qui modifie quelque chose ; ni Domain ni autre Path (préfixe __Host-).
 * Sans durée, un cookie de session du navigateur, effacé à sa fermeture
 */
export function buildAuthCookieOptions(
	isSecure: boolean,
	maxAgeMs: number | null,
): CookieOptions {
	return {
		httpOnly: true,
		secure: isSecure,
		sameSite: "lax",
		path: "/",
		...(maxAgeMs !== null && { maxAge: Math.max(0, maxAgeMs) }),
	};
}
