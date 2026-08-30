import { HttpStatutCodeErrorEnum } from "@citadel/specs/src/specUtils/httpStatutCodeError.enum.ts";

import { AppError } from "./AppError.ts";

export class DatabaseError extends AppError {
	readonly statusCode = HttpStatutCodeErrorEnum.BAD_REQUEST;
}
