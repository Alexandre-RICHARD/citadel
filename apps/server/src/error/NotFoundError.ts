import { HttpStatutCodeErrorEnum } from "@citadel/specs/src/specUtils/httpStatutCodeError.enum.ts";

import { AppError } from "./AppError.ts";

export class NotFoundError extends AppError {
	readonly statusCode = HttpStatutCodeErrorEnum.NOT_FOUND;
}
