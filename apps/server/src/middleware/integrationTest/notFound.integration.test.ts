import { TechnicalErrorCodeEnum } from "@citadel/specs/src/specUtils/error/technicalErrorCode.enum.ts";
import request from "supertest";
import { describe, it } from "vitest";

import { app } from "../../app.ts";
import { expectNotFound } from "../../testUtils/integration/expectNotFound.ts";

const UNKNOWN_URL = "/unknown-project/unknown-route";

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
	});
});
