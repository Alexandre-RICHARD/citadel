import { HttpStatutCodeErrorEnum } from "@citadel/specs/src/specUtils/httpStatutCodeError.enum.ts";
import type { NextFunction, Request, Response } from "express";

import { AppError } from "../error/AppError.ts";
import { BadRequestError } from "../error/BadRequestError.ts";
import { logError } from "../error/logError.ts";

/**
 * Point de sortie unique des erreurs : choisit le code HTTP et journalise les erreurs serveur.
 * Les erreurs client (4xx) sont attendues et ne sont pas journalisées.
 */
export function globalErrorHandler(
	error: unknown,
	request: Request,
	response: Response,
	next: NextFunction,
): void {
	const statusCode =
		error instanceof AppError
			? error.statusCode
			: HttpStatutCodeErrorEnum.SERVER_ERROR;

	if (statusCode >= HttpStatutCodeErrorEnum.SERVER_ERROR)
		void logError(error, `${request.method} ${request.originalUrl}`);

	if (response.headersSent) {
		next(error);
		return;
	}

	if (error instanceof BadRequestError) {
		response
			.status(statusCode)
			.json({ message: error.message, issues: error.issues });
		return;
	}

	response.status(statusCode).json(null);
}
