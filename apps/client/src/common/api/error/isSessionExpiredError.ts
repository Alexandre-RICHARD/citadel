import { TechnicalErrorCodeEnum } from "@citadel/specs/src/specUtils/error/technicalErrorCode.enum";
import { HttpStatutCodeErrorEnum } from "@citadel/specs/src/specUtils/httpStatutCodeError.enum";

import { ApiError } from "./ApiError";

/**
 * Le 401 d'un endpoint protégé : plus de session (expirée, déconnectée depuis un autre onglet ou un autre appareil). Un
 * autre 401 (un mot de passe refusé, INVALID_CREDENTIALS) reste une erreur de formulaire
 */
export function isSessionExpiredError(error: unknown): boolean {
	return (
		error instanceof ApiError &&
		error.status === Number(HttpStatutCodeErrorEnum.NEED_AUTHENTIFICATION) &&
		error.code === TechnicalErrorCodeEnum.AUTHENTICATION_REQUIRED
	);
}
