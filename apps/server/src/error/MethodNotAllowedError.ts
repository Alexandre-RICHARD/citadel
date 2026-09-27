import { HttpStatutCodeErrorEnum } from "@citadel/specs/src/specUtils/httpStatutCodeError.enum.ts";

import { AppError } from "./AppError.ts";

export class MethodNotAllowedError extends AppError {
	readonly statusCode = HttpStatutCodeErrorEnum.METHOD_NOT_ALLOWED;
}
