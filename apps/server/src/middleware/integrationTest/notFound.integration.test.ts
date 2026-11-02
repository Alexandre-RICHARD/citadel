import { TechnicalErrorCodeEnum } from "@citadel/specs/src/specUtils/error/technicalErrorCode.enum.ts";
import request from "supertest";
import { describe, expect, it } from "vitest";

import { app } from "../../app.ts";
import { countTableRows } from "../../testUtils/integration/countTableRows.ts";
import { expectNotFound } from "../../testUtils/integration/expectNotFound.ts";

const UNKNOWN_URL = "/unknown-project/unknown-route";
// Ancien endpoint public : seul le serveur écrit désormais dans error_log
const REMOVED_ERROR_LOG_URL = "/error-log/entries";

describe("notFound", () => {
	describe("404 Not Found", () => {
		it("SHOULD answer ROUTE_NOT_FOUND WHEN no route matches the URL", async () => {
			// Act
			const response = await request(app).get(UNKNOWN_URL);

			// Assert
			expectNotFound(
				response,
				TechnicalErrorCodeEnum.ROUTE_NOT_FOUND,
				`Route not handled by the server: GET ${UNKNOWN_URL}`,
			);
		});

		it("SHOULD answer ROUTE_NOT_FOUND without writing any error log WHEN a client posts an error log", async () => {
			// Arrange
			const errorLogCountBefore = await countTableRows("error_log");

			// Act
			const response = await request(app)
				.post(REMOVED_ERROR_LOG_URL)
				.send({ errorType: "TypeError", message: "Injected", stack: null });

			// Assert
			expectNotFound(
				response,
				TechnicalErrorCodeEnum.ROUTE_NOT_FOUND,
				`Route not handled by the server: POST ${REMOVED_ERROR_LOG_URL}`,
			);
			expect(await countTableRows("error_log")).toBe(errorLogCountBefore);
		});
	});
});
