import type { ErrorResponseDto } from "@citadel/specs/src/specUtils/error/errorResponseDto.type.ts";
import { TechnicalErrorCodeEnum } from "@citadel/specs/src/specUtils/error/technicalErrorCode.enum.ts";
import type { ValidationErrorResponseDto } from "@citadel/specs/src/specUtils/error/validationErrorResponseDto.type.ts";
import { HttpStatutCodeErrorEnum } from "@citadel/specs/src/specUtils/httpStatutCodeError.enum.ts";
import type { NextFunction, Request, Response } from "express";

import { AppError } from "../error/AppError.ts";
import { BadRequestError } from "../error/BadRequestError.ts";
import type { ErrorCode } from "../error/errorCode.type.ts";
import { logError } from "../error/logError.ts";

// Type que body-parser (express.json) donne à un corps JSON illisible
const BODY_PARSE_FAILED_TYPE = "entity.parse.failed";

function isExposedHttpError(
	error: unknown,
): error is Error & { status: number } {
	return (
		error instanceof Error &&
		"status" in error &&
		typeof error.status === "number" &&
		"expose" in error &&
		error.expose === true
	);
}

function isBodyParseError(error: unknown): boolean {
	return (
		isExposedHttpError(error) &&
		"type" in error &&
		error.type === BODY_PARSE_FAILED_TYPE
	);
}

function getStatusCode(error: unknown): number {
	if (error instanceof AppError) return error.statusCode;
	if (isExposedHttpError(error)) return error.status;
	return HttpStatutCodeErrorEnum.SERVER_ERROR;
}

function isServerError(statusCode: number): boolean {
	return statusCode >= Number(HttpStatutCodeErrorEnum.SERVER_ERROR);
}

// Erreur exposée par un middleware tiers (body-parser) : la requête a été refusée avant tout traitement
function getRejectedRequestCode(
	error: unknown,
):
	| TechnicalErrorCodeEnum.MALFORMED_JSON
	| TechnicalErrorCodeEnum.INVALID_REQUEST {
	return isBodyParseError(error)
		? TechnicalErrorCodeEnum.MALFORMED_JSON
		: TechnicalErrorCodeEnum.INVALID_REQUEST;
}

function buildErrorResponse(
	error: unknown,
	statusCode: number,
): ErrorResponseDto<ErrorCode> | ValidationErrorResponseDto {
	if (isServerError(statusCode))
		return {
			code: TechnicalErrorCodeEnum.INTERNAL_ERROR,
			message: "Internal server error",
		};

	const message = error instanceof Error ? error.message : "Request error";

	if (error instanceof BadRequestError)
		return { code: error.code, message, issues: error.issues };

	if (error instanceof AppError) return { code: error.code, message };

	if (statusCode === Number(HttpStatutCodeErrorEnum.BAD_REQUEST))
		return { code: getRejectedRequestCode(error), message, issues: [] };

	return { code: getRejectedRequestCode(error), message };
}

export function globalErrorHandler(
	error: unknown,
	request: Request,
	response: Response,
	next: NextFunction,
): void {
	const statusCode = getStatusCode(error);

	if (isServerError(statusCode))
		void logError(error, `${request.method} ${request.originalUrl}`);

	if (response.headersSent) {
		next(error);
		return;
	}

	response.status(statusCode).json(buildErrorResponse(error, statusCode));
}
