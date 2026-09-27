import type { HttpStatutCodeErrorEnum } from "@citadel/specs/src/specUtils/httpStatutCodeError.enum.ts";

/**
 * Erreur métier ou technique connue : son `statusCode` détermine la réponse HTTP
 * renvoyée par `globalErrorHandler`. Toute autre erreur donne une 500.
 */
export abstract class AppError extends Error {
	abstract readonly statusCode: HttpStatutCodeErrorEnum;

	// `options.cause` : erreur d'origine, conservée dans les logs
	constructor(message: string, options?: ErrorOptions) {
		super(message, options);
		this.name = this.constructor.name;
	}
}
