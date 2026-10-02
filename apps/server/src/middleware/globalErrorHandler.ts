import type { ErrorResponseDto } from "@citadel/specs/src/specUtils/error/errorResponseDto.ts";
import type { ValidationErrorResponseDto } from "@citadel/specs/src/specUtils/error/validationErrorResponseDto.ts";
import { HttpStatutCodeErrorEnum } from "@citadel/specs/src/specUtils/httpStatutCodeError.enum.ts";
import type { NextFunction, Request, Response } from "express";

import { AppError } from "../error/AppError.ts";
import { BadRequestError } from "../error/BadRequestError.ts";
import { logError } from "../error/logError.ts";

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

function getStatusCode(error: unknown): number {
	if (error instanceof AppError) return error.statusCode;
	if (isExposedHttpError(error)) return error.status;
	return HttpStatutCodeErrorEnum.SERVER_ERROR;
}

function isServerError(statusCode: number): boolean {
	return statusCode >= Number(HttpStatutCodeErrorEnum.SERVER_ERROR);
}

function buildErrorResponse(
	error: unknown,
	statusCode: number,
): ErrorResponseDto | ValidationErrorResponseDto {
	if (isServerError(statusCode)) return { message: "Internal server error" };

	const message = error instanceof Error ? error.message : "Request error";

	if (statusCode === Number(HttpStatutCodeErrorEnum.BAD_REQUEST)) {
		const issues = error instanceof BadRequestError ? error.issues : [];
		return { message, issues };
	}

	return { message };
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
