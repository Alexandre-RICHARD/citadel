import type { MeDto } from "@citadel/specs/src/projects/auth/dto/meDto.type.ts";
import { LoginMethodEnum } from "@citadel/specs/src/projects/auth/enum/loginMethod.enum.ts";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum.ts";
import { TechnicalErrorCodeEnum } from "@citadel/specs/src/specUtils/error/technicalErrorCode.enum.ts";
import { HttpStatutCodeErrorEnum } from "@citadel/specs/src/specUtils/httpStatutCodeError.enum.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";
import request from "supertest";
import { describe, expect, it, vi } from "vitest";

import { app } from "../../../../app.ts";
import { openTestSession } from "../../../../testUtils/integration/auth/openTestSession.ts";
import { selectAuthRows } from "../../../../testUtils/integration/auth/selectAuthRows.ts";
import { expectInternalServerError } from "../../../../testUtils/integration/expectInternalServerError.ts";
import { simulatedDatabaseFailure } from "../../../../testUtils/integration/simulatedDatabaseFailure.ts";
import { watchErrorLogs } from "../../../../testUtils/integration/watchErrorLogs.ts";
import { User } from "../../models/User.ts";

const UPDATE_ME_URL = `${ApiPrefixEnum.AUTH}/me`;

async function updateMe(body: unknown, cookie?: string) {
	const pending = request(app).patch(UPDATE_ME_URL);
	return (cookie === undefined ? pending : pending.set("Cookie", cookie)).send(
		body as object,
	);
}

describe("updateMe", () => {
	describe("200 OK", () => {
		it("SHOULD change the display name and answer the account WHEN it is valid", async () => {
			// Arrange
			const session = await openTestSession();

			// Act
			const response = await updateMe(
				{ displayName: "  Élodie   la Rêveuse " },
				session.cookie,
			);

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
			expect(response.headers["cache-control"]).toBe("no-store");
			expect((response.body as MeDto).displayName).toBe("Élodie la Rêveuse");
			expect((await selectAuthRows.user(session.userId))?.displayName).toBe(
				"Élodie la Rêveuse",
			);
		});

		it("SHOULD give the username back as display name WHEN the new display name is empty", async () => {
			// Arrange
			const session = await openTestSession();
			await updateMe({ displayName: "Quelqu'un" }, session.cookie);

			// Act
			const response = await updateMe({ displayName: "  " }, session.cookie);

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
			expect((response.body as MeDto).displayName).toBeNull();
		});

		it("SHOULD change the login methods and keep the display name WHEN only they are sent", async () => {
			// Arrange
			const session = await openTestSession();
			await updateMe({ displayName: "Quelqu'un" }, session.cookie);

			// Act
			const response = await updateMe(
				{ loginMethods: LoginMethodEnum.MAIL },
				session.cookie,
			);

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
			expect(response.body).toMatchObject({
				displayName: "Quelqu'un",
				loginMethods: LoginMethodEnum.MAIL,
			});
		});

		it("SHOULD never touch the account of another user", async () => {
			// Arrange
			const session = await openTestSession();
			const other = await openTestSession();

			// Act
			await updateMe({ displayName: "Moi seul" }, session.cookie);

			// Assert
			expect((await selectAuthRows.user(other.userId))?.displayName).toBeNull();
		});
	});

	describe("400 Bad Request", () => {
		it.each([
			{ reason: "the body is empty", body: {} },
			{
				reason: "the display name has an invisible character",
				body: { displayName: "A​b" },
			},
			{
				reason: "the login methods are unknown",
				body: { loginMethods: "sms" },
			},
		])("SHOULD refuse WHEN $reason", async ({ body }) => {
			// Arrange
			const session = await openTestSession();

			// Act
			const response = await updateMe(body, session.cookie);

			// Assert
			expect(response.status).toBe(HttpStatutCodeErrorEnum.BAD_REQUEST);
		});
	});

	describe("401 Unauthorized", () => {
		it("SHOULD refuse WHEN the request has no session", async () => {
			// Act
			const response = await updateMe({ displayName: "Quelqu'un" });

			// Assert
			expect(response.status).toBe(
				HttpStatutCodeErrorEnum.NEED_AUTHENTIFICATION,
			);
			expect(response.body).toMatchObject({
				code: TechnicalErrorCodeEnum.AUTHENTICATION_REQUIRED,
			});
		});
	});

	describe("500 Internal Server Error", () => {
		it("SHOULD answer a generic error and log it WHEN the update fails", async () => {
			// Arrange
			const session = await openTestSession();
			const errorLogWatcher = await watchErrorLogs();
			vi.spyOn(User, "findByPk").mockRejectedValueOnce(
				simulatedDatabaseFailure(),
			);

			// Act
			const response = await updateMe(
				{ displayName: "Quelqu'un" },
				session.cookie,
			);

			// Assert
			expectInternalServerError(response);
			await errorLogWatcher.expectLogged({
				errorType: "DatabaseError",
				message: `[PATCH ${UPDATE_ME_URL}] Failed to update profile`,
			});
		});
	});
});
