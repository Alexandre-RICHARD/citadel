import type { ValidationErrorResponseDto } from "@citadel/specs/src/specUtils/error/validationErrorResponse.dto.ts";
import { HttpStatutCodeErrorEnum } from "@citadel/specs/src/specUtils/httpStatutCodeError.enum.ts";

import { AppError } from "./AppError.ts";

export class BadRequestError extends AppError {
	readonly statusCode = HttpStatutCodeErrorEnum.BAD_REQUEST;

	readonly issues: ValidationErrorResponseDto["issues"];

	constructor(
		message: string,
		issues: ValidationErrorResponseDto["issues"] = [],
	) {
		super(message);
		this.issues = issues;
	}
}
