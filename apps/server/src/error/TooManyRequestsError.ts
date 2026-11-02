import { DurationMsEnum } from "@citadel/common/src/universal/date/durationMs.enum.ts";
import { TechnicalErrorCodeEnum } from "@citadel/specs/src/specUtils/error/technicalErrorCode.enum.ts";
import { HttpStatutCodeErrorEnum } from "@citadel/specs/src/specUtils/httpStatutCodeError.enum.ts";

import { AppError } from "./AppError.ts";

/**
 * Une limite est atteinte (messages par heure…). `globalErrorHandler` pose `retryAfterSeconds` dans l'en-tête
 * Retry-After : le front affiche le compte à rebours au lieu de laisser réessayer tout de suite
 */
export class TooManyRequestsError extends AppError {
	readonly statusCode = HttpStatutCodeErrorEnum.TOO_MANY_REQUESTS;

	readonly code = TechnicalErrorCodeEnum.TOO_MANY_REQUESTS;

	// Au moins une seconde : un Retry-After de 0 inviterait à réessayer aussitôt
	readonly retryAfterSeconds: number;

	constructor(message: string, retryAfterMs: number) {
		super(message);
		this.retryAfterSeconds = Math.max(
			1,
			Math.ceil(retryAfterMs / DurationMsEnum.SECOND),
		);
	}
}
