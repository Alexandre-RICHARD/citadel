import { HttpStatutCodeErrorEnum } from "@citadel/specs/src/specUtils/httpStatutCodeError.enum";

import { ApiError } from "./ApiError";

// Échec passager, que rejouer la même requête peut corriger : pas de réponse, ou erreur serveur.
// Jamais une 4xx, qui redonnerait le même résultat
export function isTransientApiError(error: unknown): boolean {
	return (
		error instanceof ApiError &&
		(error.status === null ||
			error.status >= Number(HttpStatutCodeErrorEnum.SERVER_ERROR))
	);
}
