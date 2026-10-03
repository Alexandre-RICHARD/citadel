import { TechnicalErrorCodeEnum } from "@citadel/specs/src/specUtils/error/technicalErrorCode.enum.ts";
import { HttpStatutCodeErrorEnum } from "@citadel/specs/src/specUtils/httpStatutCodeError.enum.ts";

import { AppError } from "./AppError.ts";

export class DatabaseError extends AppError {
	readonly statusCode = HttpStatutCodeErrorEnum.SERVER_ERROR;

	readonly code = TechnicalErrorCodeEnum.INTERNAL_ERROR;
}
