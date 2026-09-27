import type { NextFunction, Request, Response } from "express";

import { MethodNotAllowedError } from "../error/MethodNotAllowedError.ts";

export function unhandledMethod(
	request: Request,
	_response: Response,
	next: NextFunction,
): void {
	if (["HEAD", "OPTIONS", "TRACE", "CONNECT"].includes(request.method)) {
		next(
			new MethodNotAllowedError(
				`HTTP method not handled by the server: ${request.method}`,
			),
		);
		return;
	}

	next();
}
