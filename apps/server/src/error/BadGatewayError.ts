import { HttpStatutCodeErrorEnum } from "@citadel/specs/src/specUtils/httpStatutCodeError.enum.ts";

import { AppError } from "./AppError.ts";
import type { ErrorCode } from "./errorCode.type.ts";

/**
 * Un service extérieur (IGDB…) n'a pas répondu comme prévu. Contrairement à une 500, le code reste dans la réponse :
 * le front peut dire quel service manque, et l'action peut réussir plus tard. L'erreur est loggée comme une 500
 */
export class BadGatewayError extends AppError {
	readonly statusCode = HttpStatutCodeErrorEnum.BAD_GATEWAY;

	readonly code: ErrorCode;

	constructor(code: ErrorCode, message: string, options?: ErrorOptions) {
		super(message, options);
		this.code = code;
	}
}
