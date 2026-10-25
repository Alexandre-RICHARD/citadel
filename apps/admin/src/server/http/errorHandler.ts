import type { NextFunction, Request, Response } from "express";

import type { ApiErrorBody } from "../../shared/apiErrorBody.type.ts";
import { HttpError } from "./HttpError.ts";

// Express reconnaît un gestionnaire d'erreurs à ses quatre paramètres : next doit rester
export function errorHandler(
	error: unknown,
	_request: Request,
	response: Response<ApiErrorBody>,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	_next: NextFunction,
): void {
	if (error instanceof HttpError) {
		response.status(error.status).json({ message: error.message });
		return;
	}
	console.error("Erreur inattendue :", error);
	response.status(500).json({ message: "Erreur interne de la console" });
}
