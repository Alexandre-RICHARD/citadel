import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum.ts";
import { TechnicalErrorCodeEnum } from "@citadel/specs/src/specUtils/error/technicalErrorCode.enum.ts";
import { HttpStatutCodeErrorEnum } from "@citadel/specs/src/specUtils/httpStatutCodeError.enum.ts";
import request from "supertest";
import { describe, expect, it } from "vitest";

import { app } from "../../app.ts";
import { countTableRows } from "../../testUtils/integration/countTableRows.ts";

const CREATE_GAME_URL = `${ApiPrefixEnum.GAME_DEATH_COUNTER}/games`;

// Au-delà de la limite par défaut d'express.json (100 ko)
const OVERSIZED_NAME = "a".repeat(101 * 1024);

describe("globalErrorHandler", () => {
	describe("413 Content Too Large", () => {
		it("SHOULD answer INVALID_REQUEST without changing anything WHEN express.json rejects the body before any validation", async () => {
			// Arrange
			const gameCountBefore = await countTableRows("game");

			// Act
			const response = await request(app)
				.post(CREATE_GAME_URL)
				.send({ name: OVERSIZED_NAME });

			// Assert
			expect(response.status).toBe(HttpStatutCodeErrorEnum.CONTENT_TOO_LARGE);
			expect(response.body).toStrictEqual({
				code: TechnicalErrorCodeEnum.INVALID_REQUEST,
				message: expect.any(String) as string,
			});
			expect(await countTableRows("game")).toBe(gameCountBefore);
		});
	});
});
