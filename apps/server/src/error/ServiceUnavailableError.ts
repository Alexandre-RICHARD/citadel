import { HttpStatutCodeErrorEnum } from "@citadel/specs/src/specUtils/httpStatutCodeError.enum.ts";

import { AppError } from "./AppError.ts";
import type { ErrorCode } from "./errorCode.type.ts";
import { toRetryAfterSeconds } from "./toRetryAfterSeconds.ts";

/**
 * Le serveur est trop sollicité pour l'instant (trop de mots de passe à vérifier en même temps) : rien n'est cassé, la
 * même requête passera dans un instant. Comme un 429, `globalErrorHandler` pose Retry-After
 */
export class ServiceUnavailableError extends AppError {
	readonly statusCode = HttpStatutCodeErrorEnum.SERVICE_UNAVAILABLE;

	readonly code: ErrorCode;

	readonly retryAfterSeconds: number;

	constructor(code: ErrorCode, message: string, retryAfterMs: number) {
		super(message);
		this.code = code;
		this.retryAfterSeconds = toRetryAfterSeconds(retryAfterMs);
	}
}
