import { TechnicalErrorCodeEnum } from "@citadel/specs/src/specUtils/error/technicalErrorCode.enum.ts";
import { HttpStatutCodeErrorEnum } from "@citadel/specs/src/specUtils/httpStatutCodeError.enum.ts";
import type { Response } from "supertest";
import { expect } from "vitest";

// Une 500 ne doit rien dévoiler de l'erreur d'origine
export function expectInternalServerError(response: Response): void {
	expect(response.status).toBe(HttpStatutCodeErrorEnum.SERVER_ERROR);
	expect(response.body).toStrictEqual({
		code: TechnicalErrorCodeEnum.INTERNAL_ERROR,
		message: "Internal server error",
	});
}
