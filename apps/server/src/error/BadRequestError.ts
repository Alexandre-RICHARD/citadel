import { TechnicalErrorCodeEnum } from "@citadel/specs/src/specUtils/error/technicalErrorCode.enum.ts";
import type { ValidationErrorResponseDto } from "@citadel/specs/src/specUtils/error/validationErrorResponseDto.type.ts";
import { HttpStatutCodeErrorEnum } from "@citadel/specs/src/specUtils/httpStatutCodeError.enum.ts";

import { AppError } from "./AppError.ts";

export class BadRequestError extends AppError {
	readonly statusCode = HttpStatutCodeErrorEnum.BAD_REQUEST;

	readonly code = TechnicalErrorCodeEnum.VALIDATION_FAILED;

	readonly issues: ValidationErrorResponseDto["issues"];

	constructor(
		message: string,
		issues: ValidationErrorResponseDto["issues"] = [],
	) {
		super(message);
		this.issues = issues;
	}
}
