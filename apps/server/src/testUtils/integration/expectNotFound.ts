import { HttpStatutCodeErrorEnum } from "@citadel/specs/src/specUtils/httpStatutCodeError.enum.ts";
import type { Response } from "supertest";
import { expect } from "vitest";

export function expectNotFound(response: Response, message: string): void {
	expect(response.status).toBe(HttpStatutCodeErrorEnum.NOT_FOUND);
	expect(response.body).toStrictEqual({ message });
}
