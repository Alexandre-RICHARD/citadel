import { HttpStatutCodeErrorEnum } from "@citadel/specs/src/specUtils/httpStatutCodeError.enum.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";
import request from "supertest";
import { describe, expect, it, vi } from "vitest";

import { app } from "../../app.ts";
import { env } from "../../configuration/env.ts";
import { sequelize } from "../../configuration/sequelize.ts";
import { simulatedDatabaseFailure } from "../../testUtils/integration/simulatedDatabaseFailure.ts";

const HEALTH_URL = "/health";

describe("health", () => {
	describe("200 OK", () => {
		it("SHOULD answer the running version and an available database WHEN the database responds", async () => {
			// Act
			const response = await request(app).get(HEALTH_URL);

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
			expect(response.body).toStrictEqual({
				status: "ok",
				version: env.APP_VERSION,
				db: "up",
			});
			expect(response.headers["cache-control"]).toBe("no-store");
		});
	});

	describe("503 Service Unavailable", () => {
		it("SHOULD answer an unavailable database WHEN the database does not respond", async () => {
			// Arrange
			vi.spyOn(sequelize, "authenticate").mockRejectedValueOnce(
				simulatedDatabaseFailure(),
			);

			// Act
			const response = await request(app).get(HEALTH_URL);

			// Assert
			expect(response.status).toBe(HttpStatutCodeErrorEnum.SERVICE_UNAVAILABLE);
			expect(response.body).toStrictEqual({
				status: "error",
				version: env.APP_VERSION,
				db: "down",
			});
		});
	});
});
