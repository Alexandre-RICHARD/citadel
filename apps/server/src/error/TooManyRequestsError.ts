import type { AuthErrorCodeEnum } from "@citadel/specs/src/projects/auth/error/authErrorCode.enum.ts";
import { TechnicalErrorCodeEnum } from "@citadel/specs/src/specUtils/error/technicalErrorCode.enum.ts";
import { HttpStatutCodeErrorEnum } from "@citadel/specs/src/specUtils/httpStatutCodeError.enum.ts";

import { AppError } from "./AppError.ts";
import { toRetryAfterSeconds } from "./toRetryAfterSeconds.ts";

/**
 * Une limite est atteinte (messages par heure…). `globalErrorHandler` pose `retryAfterSeconds` dans l'en-tête
 * Retry-After : le front affiche le compte à rebours au lieu de laisser réessayer tout de suite. TOO_MANY_ATTEMPTS : le
 * délai ou le bannissement d'une connexion ratée, que le formulaire distingue d'une simple limite de débit
 */
export class TooManyRequestsError extends AppError {
	readonly statusCode = HttpStatutCodeErrorEnum.TOO_MANY_REQUESTS;

	readonly code:
		| TechnicalErrorCodeEnum.TOO_MANY_REQUESTS
		| AuthErrorCodeEnum.TOO_MANY_ATTEMPTS;

	readonly retryAfterSeconds: number;

	constructor(
		message: string,
		retryAfterMs: number,
		code:
			| TechnicalErrorCodeEnum.TOO_MANY_REQUESTS
			| AuthErrorCodeEnum.TOO_MANY_ATTEMPTS = TechnicalErrorCodeEnum.TOO_MANY_REQUESTS,
	) {
		super(message);
		this.code = code;
		this.retryAfterSeconds = toRetryAfterSeconds(retryAfterMs);
	}
}
