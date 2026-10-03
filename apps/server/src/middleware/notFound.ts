import { TechnicalErrorCodeEnum } from "@citadel/specs/src/specUtils/error/technicalErrorCode.enum.ts";
import type { NextFunction, Request, Response } from "express";

import { NotFoundError } from "../error/NotFoundError.ts";

export function notFound(
	request: Request,
	_response: Response,
	next: NextFunction,
): void {
	next(
		new NotFoundError(
			TechnicalErrorCodeEnum.ROUTE_NOT_FOUND,
			`Route not handled by the server: ${request.method} ${request.originalUrl}`,
		),
	);
}
