import { HttpStatutCodeErrorEnum } from "@citadel/specs/src/specUtils/httpStatutCodeError.enum.ts";

import { AppError } from "./AppError.ts";
import type { ErrorCode } from "./errorCode.type.ts";

export class NotFoundError extends AppError {
	readonly statusCode = HttpStatutCodeErrorEnum.NOT_FOUND;

	// Le code dit quoi est introuvable (GAME_NOT_FOUND, ROUTE_NOT_FOUND…)
	readonly code: ErrorCode;

	constructor(code: ErrorCode, message: string) {
		super(message);
		this.code = code;
	}
}
