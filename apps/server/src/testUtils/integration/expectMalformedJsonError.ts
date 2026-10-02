import { HttpStatutCodeErrorEnum } from "@citadel/specs/src/specUtils/httpStatutCodeError.enum.ts";
import type { Response } from "supertest";
import { expect } from "vitest";

// Un JSON illisible est refusé par express.json avant toute validation : pas de détail par champ
export function expectMalformedJsonError(response: Response): void {
	expect(response.status).toBe(HttpStatutCodeErrorEnum.BAD_REQUEST);
	expect(response.body).toStrictEqual({
		message: expect.any(String) as string,
		issues: [],
	});
}
