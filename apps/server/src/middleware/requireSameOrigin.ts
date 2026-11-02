import { classifyRequestOrigin } from "@citadel/common/src/universal/http/classifyRequestOrigin.ts";
import { RequestOriginEnum } from "@citadel/common/src/universal/http/requestOrigin.enum.ts";
import { TechnicalErrorCodeEnum } from "@citadel/specs/src/specUtils/error/technicalErrorCode.enum.ts";
import type { NextFunction, Request, Response } from "express";

import { ForbiddenError } from "../error/ForbiddenError.ts";

/**
 * Protection CSRF, en plus du cookie SameSite=Lax : une requête qui modifie quelque chose (POST, PUT, PATCH, DELETE)
 * envoyée depuis la page d'un autre site est refusée. Sans en-tête Origin, elle passe : un navigateur l'envoie toujours
 * sur ces méthodes, seuls la console du NAS et ses jobs (et les tests) n'en mettent pas, et ils n'ont pas de cookie.
 * Caddy (comme Vite en dev) transmet l'en-tête Host d'origine : il vaut l'hôte de la page
 */
export function requireSameOrigin(
	request: Request,
	_response: Response,
	next: NextFunction,
): void {
	const origin = classifyRequestOrigin({
		method: request.method,
		origin: request.get("Origin"),
		host: request.get("Host"),
	});
	if (origin === RequestOriginEnum.FOREIGN)
		throw new ForbiddenError(
			TechnicalErrorCodeEnum.FOREIGN_ORIGIN,
			"The request comes from a page of another site",
		);
	next();
}
