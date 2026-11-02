import type { UsernameAvailabilityDto } from "@citadel/specs/src/projects/auth/dto/usernameAvailabilityDto.type.ts";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum.ts";
import { ValidationIssueCodeEnum } from "@citadel/specs/src/specUtils/error/validationIssueCode.enum.ts";
import { HttpStatutCodeErrorEnum } from "@citadel/specs/src/specUtils/httpStatutCodeError.enum.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";
import request from "supertest";
import { describe, expect, it } from "vitest";

import { app } from "../../../../app.ts";
import { insertAuthRows } from "../../../../testUtils/integration/auth/insertAuthRows.ts";
import { buildUniqueIp } from "../../../../testUtils/integration/buildUniqueIp.ts";
import { buildUniqueWord } from "../../../../testUtils/integration/buildUniqueWord.ts";
import { expectValidationError } from "../../../../testUtils/integration/expectValidationError.ts";

async function getAvailability(username: string, ip = buildUniqueIp()) {
	return request(app)
		.get(
			`${ApiPrefixEnum.AUTH}/usernames/${encodeURIComponent(username)}/availability`,
		)
		.set("X-Real-IP", ip);
}

describe("getUsernameAvailability", () => {
	describe("200 OK", () => {
		it("SHOULD say a username is taken, never cached, WHEN an account has it exactly", async () => {
			// Arrange
			const username = buildUniqueWord();
			await insertAuthRows.user({ username });

			// Act
			const response = await getAvailability(username);

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
			expect(response.headers["cache-control"]).toBe("no-store");
			expect(response.body as UsernameAvailabilityDto).toStrictEqual({
				isAvailable: false,
			});
		});

		it.each([
			{ reason: "no account has it", usernameOf: () => buildUniqueWord() },
			{
				reason: "an account has it in another case only",
				usernameOf: (taken: string) => taken.toUpperCase(),
			},
		])("SHOULD say a username is free WHEN $reason", async ({ usernameOf }) => {
			// Arrange
			const taken = buildUniqueWord().toLowerCase();
			await insertAuthRows.user({ username: taken });

			// Act
			const response = await getAvailability(usernameOf(taken));

			// Assert
			expect(response.body as UsernameAvailabilityDto).toStrictEqual({
				isAvailable: true,
			});
		});
	});

	describe("400 Bad Request", () => {
		it("SHOULD refuse a username WHEN it has an accent", async () => {
			// Act
			const response = await getAvailability("Élodie");

			// Assert
			expectValidationError(response, [
				{
					path: ["username"],
					code: ValidationIssueCodeEnum.INVALID_FORMAT,
					message: "Username should contain only A-Z, a-z, 0-9, _ and -",
				},
			]);
		});
	});

	describe("429 Too Many Requests", () => {
		it("SHOULD refuse a 61st check an hour WHEN they come from one IP", async () => {
			// Arrange
			const ip = buildUniqueIp();
			for (let index = 0; index < 60; index++)
				// eslint-disable-next-line no-await-in-loop
				await getAvailability(buildUniqueWord(), ip);

			// Act
			const response = await getAvailability(buildUniqueWord(), ip);

			// Assert
			expect(response.status).toBe(HttpStatutCodeErrorEnum.TOO_MANY_REQUESTS);
			expect(response.body).toMatchObject({
				message: "Too many username checks from this IP",
			});
		});
	});
});
