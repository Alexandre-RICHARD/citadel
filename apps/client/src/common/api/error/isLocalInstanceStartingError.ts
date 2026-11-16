import { TechnicalErrorCodeEnum } from "@citadel/specs/src/specUtils/error/technicalErrorCode.enum";

import { ApiError } from "./ApiError";

/**
 * La réponse de la console du NAS à la place de l'instance locale du backlog des médias, arrêtée pour inactivité : elle
 * vient de la démarrer. La page attend puis se recharge, sans rejouer la requête ni afficher d'erreur
 */
export function isLocalInstanceStartingError(error: unknown): boolean {
	return (
		error instanceof ApiError &&
		error.code === TechnicalErrorCodeEnum.LOCAL_INSTANCE_STARTING
	);
}
