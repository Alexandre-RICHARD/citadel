import { HttpStatutCodeErrorEnum } from "@citadel/specs/src/specUtils/httpStatutCodeError.enum.ts";

import { AppError } from "./AppError.ts";
import type { ErrorCode } from "./errorCode.type.ts";

// La requête est valide, mais la fonction est fermée pour l'instant (formulaire de contact fermé par le quota…)
export class ForbiddenError extends AppError {
	readonly statusCode = HttpStatutCodeErrorEnum.FORBIDDEN;

	readonly code: ErrorCode;

	constructor(code: ErrorCode, message: string) {
		super(message);
		this.code = code;
	}
}
