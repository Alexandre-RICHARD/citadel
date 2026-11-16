import { HttpStatutCodeErrorEnum } from "@citadel/specs/src/specUtils/httpStatutCodeError.enum";

import { ApiError } from "./ApiError";
import { isLocalInstanceStartingError } from "./isLocalInstanceStartingError";

// Échec passager, que rejouer la même requête peut corriger : pas de réponse, ou erreur serveur.
// Jamais une 4xx, qui redonnerait le même résultat, ni le démarrage de l'instance locale, que la page attend elle-même
export function isTransientApiError(error: unknown): boolean {
	return (
		error instanceof ApiError &&
		!isLocalInstanceStartingError(error) &&
		(error.status === null ||
			error.status >= Number(HttpStatutCodeErrorEnum.SERVER_ERROR))
	);
}
