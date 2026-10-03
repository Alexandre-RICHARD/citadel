import { TechnicalErrorCodeEnum } from "@citadel/specs/src/specUtils/error/technicalErrorCode.enum.ts";
import type { ValidationErrorResponseDto } from "@citadel/specs/src/specUtils/error/validationErrorResponseDto.type.ts";
import { HttpStatutCodeErrorEnum } from "@citadel/specs/src/specUtils/httpStatutCodeError.enum.ts";
import type { Response } from "supertest";
import { expect } from "vitest";

// Réponse de requestValidator : un message commun et le détail de chaque champ refusé
export function expectValidationError(
	response: Response,
	issues: ValidationErrorResponseDto["issues"],
): void {
	expect(response.status).toBe(HttpStatutCodeErrorEnum.BAD_REQUEST);
	expect(response.body).toStrictEqual({
		code: TechnicalErrorCodeEnum.VALIDATION_FAILED,
		message: "Parsing of request failed",
		issues,
	});
}
