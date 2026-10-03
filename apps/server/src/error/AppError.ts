import type { HttpStatutCodeErrorEnum } from "@citadel/specs/src/specUtils/httpStatutCodeError.enum.ts";

import type { ErrorCode } from "./errorCode.type.ts";

/**
 * Erreur métier ou technique connue : son `statusCode` et son `code` déterminent la réponse HTTP
 * renvoyée par `globalErrorHandler`. Toute autre erreur donne une 500.
 */
export abstract class AppError extends Error {
	abstract readonly statusCode: HttpStatutCodeErrorEnum;

	abstract readonly code: ErrorCode;

	// `options.cause` : erreur d'origine, conservée dans les logs
	constructor(message: string, options?: ErrorOptions) {
		super(message, options);
		this.name = this.constructor.name;
	}
}
