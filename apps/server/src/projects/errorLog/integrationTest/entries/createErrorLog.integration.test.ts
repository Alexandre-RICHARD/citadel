import type { ErrorLogDto } from "@citadel/specs/src/projects/errorLog/dto/errorLog/errorLogDto.ts";
import type { CreateErrorLogBodyDto } from "@citadel/specs/src/projects/errorLog/endpoint/entries/createErrorLog/createErrorLogBodyDto.ts";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";
import request from "supertest";
import { describe, expect, test } from "vitest";

import { app } from "../../../../app.ts";
import { ErrorLog } from "../../models/ErrorLog.ts";

const CREATE_ERROR_LOG_URL = `${ApiPrefixEnum.ERROR_LOG}/entries`;

describe(`POST ${CREATE_ERROR_LOG_URL}`, () => {
	test("crée l'entrée en base et la renvoie", async () => {
		// Arrange
		const createErrorLogBody: CreateErrorLogBodyDto = {
			errorType: "TypeError",
			message: "Cannot read properties of undefined (reading 'id')",
			stack:
				"TypeError: Cannot read properties of undefined\n    at foo (bar.ts:1:1)",
		};

		// Act
		const requestStartedAt = new Date();
		const response = await request(app)
			.post(CREATE_ERROR_LOG_URL)
			.send(createErrorLogBody);
		const requestEndedAt = new Date();

		// Assert : réponse
		expect(response.status).toBe(HttpStatutCodeSuccessEnum.CREATED);

		const errorLogDto = response.body as ErrorLogDto;
		expect(errorLogDto).toStrictEqual({
			id: expect.any(Number) as number,
			errorType: createErrorLogBody.errorType,
			message: createErrorLogBody.message,
			stack: createErrorLogBody.stack,
			createdAt: expect.any(String) as string,
		});

		const createdAt = new Date(errorLogDto.createdAt);
		expect(createdAt.toISOString()).toBe(errorLogDto.createdAt);
		expect(createdAt.getTime()).toBeGreaterThanOrEqual(
			requestStartedAt.getTime(),
		);
		expect(createdAt.getTime()).toBeLessThanOrEqual(requestEndedAt.getTime());

		// Assert : base
		const errorLogs = await ErrorLog.findAll({ raw: true });
		expect(errorLogs).toStrictEqual([
			{
				id: errorLogDto.id,
				errorType: createErrorLogBody.errorType,
				message: createErrorLogBody.message,
				stack: createErrorLogBody.stack,
				createdAt,
			},
		]);
	});
});
