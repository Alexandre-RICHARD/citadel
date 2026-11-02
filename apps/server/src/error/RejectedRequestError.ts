import { HttpStatutCodeErrorEnum } from "@citadel/specs/src/specUtils/httpStatutCodeError.enum.ts";

import { AppError } from "./AppError.ts";
import type { ErrorCode } from "./errorCode.type.ts";

// 400 métier : la requête est bien formée, mais une règle la refuse (code faux, parcours expiré…). Sans `issues` : aucun
// champ n'est mal rempli, contrairement à BadRequestError
export class RejectedRequestError extends AppError {
	readonly statusCode = HttpStatutCodeErrorEnum.BAD_REQUEST;

	readonly code: ErrorCode;

	constructor(code: ErrorCode, message: string) {
		super(message);
		this.code = code;
	}
}
