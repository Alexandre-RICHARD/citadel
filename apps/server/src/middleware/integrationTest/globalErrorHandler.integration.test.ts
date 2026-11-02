import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum.ts";
import { TechnicalErrorCodeEnum } from "@citadel/specs/src/specUtils/error/technicalErrorCode.enum.ts";
import { HttpStatutCodeErrorEnum } from "@citadel/specs/src/specUtils/httpStatutCodeError.enum.ts";
import express from "express";
import request from "supertest";
import { describe, expect, it } from "vitest";

import { app } from "../../app.ts";
import { UnauthorizedError } from "../../error/UnauthorizedError.ts";
import { countTableRows } from "../../testUtils/integration/countTableRows.ts";
import { globalErrorHandler } from "../globalErrorHandler.ts";

const CREATE_GAME_URL = `${ApiPrefixEnum.GAME_DEATH_COUNTER}/games`;

// Au-delà de la limite par défaut d'express.json (100 ko)
const OVERSIZED_NAME = "a".repeat(101 * 1024);

// Une route de test lève l'erreur, sans dépendre d'un endpoint protégé
const UNAUTHORIZED_URL = "/unauthorized";
const UNAUTHORIZED_CODE = TechnicalErrorCodeEnum.AUTHENTICATION_REQUIRED;
const unauthorizedApp = express();
unauthorizedApp.get(UNAUTHORIZED_URL, () => {
	throw new UnauthorizedError(UNAUTHORIZED_CODE, "Session required");
});
unauthorizedApp.use(globalErrorHandler);

describe("globalErrorHandler", () => {
	describe("401 Unauthorized", () => {
		it("SHOULD answer the code of the error without logging it WHEN a route throws an UnauthorizedError", async () => {
			// Arrange
			const errorLogCountBefore = await countTableRows("error_log");

			// Act
			const response = await request(unauthorizedApp).get(UNAUTHORIZED_URL);

			// Assert
			expect(response.status).toBe(
				HttpStatutCodeErrorEnum.NEED_AUTHENTIFICATION,
			);
			expect(response.body).toStrictEqual({
				code: UNAUTHORIZED_CODE,
				message: "Session required",
			});
			expect(await countTableRows("error_log")).toBe(errorLogCountBefore);
		});
	});

	describe("413 Content Too Large", () => {
		it("SHOULD answer INVALID_REQUEST without changing anything WHEN express.json rejects the body before any validation", async () => {
			// Arrange
			const gameCountBefore = await countTableRows("gdc_game");

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
			expect(await countTableRows("gdc_game")).toBe(gameCountBefore);
		});
	});
});
