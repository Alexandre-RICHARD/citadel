import type { NextFunction, Request, Response } from "express";

import { allowedHttpMethods } from "../common/http/allowedHttpMethods.ts";
import { MethodNotAllowedError } from "../error/MethodNotAllowedError.ts";

export function unhandledMethod(
	request: Request,
	response: Response,
	next: NextFunction,
): void {
	if (!allowedHttpMethods.includes(request.method)) {
		// Header obligatoire pour une 405 (RFC 9110)
		response.setHeader("Allow", allowedHttpMethods.join(", "));
		next(
			new MethodNotAllowedError(
				`HTTP method not handled by the server: ${request.method}`,
			),
		);
		return;
	}

	next();
}
