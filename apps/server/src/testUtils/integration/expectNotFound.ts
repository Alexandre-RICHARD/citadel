import { HttpStatutCodeErrorEnum } from "@citadel/specs/src/specUtils/httpStatutCodeError.enum.ts";
import type { Response } from "supertest";
import { expect } from "vitest";

import type { ErrorCode } from "../../error/errorCode.type.ts";

export function expectNotFound(
	response: Response,
	code: ErrorCode,
	message: string,
): void {
	expect(response.status).toBe(HttpStatutCodeErrorEnum.NOT_FOUND);
	expect(response.body).toStrictEqual({ code, message });
}
