import { HttpStatutCodeErrorEnum } from "@citadel/specs/src/specUtils/httpStatutCodeError.enum.ts";
import type { Response } from "supertest";
import { expect } from "vitest";

import type { ErrorCode } from "../../error/errorCode.type.ts";

export function expectConflict(
	response: Response,
	code: ErrorCode,
	message: string,
): void {
	expect(response.status).toBe(HttpStatutCodeErrorEnum.CONFLICT_WITH_SERVER);
	expect(response.body).toStrictEqual({ code, message });
}
