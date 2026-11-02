import { HttpStatutCodeErrorEnum } from "@citadel/specs/src/specUtils/httpStatutCodeError.enum.ts";

import { AppError } from "./AppError.ts";
import type { ErrorCode } from "./errorCode.type.ts";

// Pas de session valide (connexion exigée), ou des identifiants refusés : le code dit lequel des deux
export class UnauthorizedError extends AppError {
	readonly statusCode = HttpStatutCodeErrorEnum.NEED_AUTHENTIFICATION;

	readonly code: ErrorCode;

	constructor(code: ErrorCode, message: string) {
		super(message);
		this.code = code;
	}
}
