import { HttpStatutCodeErrorEnum } from "@citadel/specs/src/specUtils/httpStatutCodeError.enum.ts";

import { AppError } from "./AppError.ts";
import type { ErrorCode } from "./errorCode.type.ts";

// La requête est valide, mais l'état de la base la refuse (déjà en base, plateforme non proposée…)
export class ConflictError extends AppError {
	readonly statusCode = HttpStatutCodeErrorEnum.CONFLICT_WITH_SERVER;

	readonly code: ErrorCode;

	constructor(code: ErrorCode, message: string) {
		super(message);
		this.code = code;
	}
}
