import { TechnicalErrorCodeEnum } from "@citadel/specs/src/specUtils/error/technicalErrorCode.enum.ts";
import { HttpStatutCodeErrorEnum } from "@citadel/specs/src/specUtils/httpStatutCodeError.enum.ts";
import type { Response } from "supertest";
import { expect } from "vitest";

// Le refus de tout endpoint protégé appelé sans session valide
export function expectAuthenticationRequired(response: Response): void {
	expect(response.status).toBe(HttpStatutCodeErrorEnum.NEED_AUTHENTIFICATION);
	expect((response.body as { code: string }).code).toBe(
		TechnicalErrorCodeEnum.AUTHENTICATION_REQUIRED,
	);
}
