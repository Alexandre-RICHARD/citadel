import { HttpStatutCodeErrorEnum } from "@citadel/specs/src/specUtils/httpStatutCodeError.enum.ts";

import { AppError } from "./AppError.ts";

export class BadRequestError extends AppError {
	readonly statusCode = HttpStatutCodeErrorEnum.BAD_REQUEST;

	readonly issues: unknown[];

	constructor(message: string, issues: unknown[] = []) {
		super(message);
		this.issues = issues;
	}
}
