import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum.ts";
import { HttpStatutCodeErrorEnum } from "@citadel/specs/src/specUtils/httpStatutCodeError.enum.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";
import request from "supertest";
import { describe, expect, it, vi } from "vitest";

import { app } from "../../../../app.ts";
import { openTestSession } from "../../../../testUtils/integration/auth/openTestSession.ts";
import { readSetCookie } from "../../../../testUtils/integration/auth/readSetCookie.ts";
import { selectAuthRows } from "../../../../testUtils/integration/auth/selectAuthRows.ts";
import { expectInternalServerError } from "../../../../testUtils/integration/expectInternalServerError.ts";
import { simulatedDatabaseFailure } from "../../../../testUtils/integration/simulatedDatabaseFailure.ts";
import { watchErrorLogs } from "../../../../testUtils/integration/watchErrorLogs.ts";
import { sessionCookie } from "../../cookie/sessionCookie.ts";
import { Session } from "../../models/Session.ts";

const LOGOUT_URL = `${ApiPrefixEnum.AUTH}/logout`;

async function logout(cookie?: string) {
	const pending = request(app).post(LOGOUT_URL);
	return cookie === undefined ? pending : pending.set("Cookie", cookie);
}

function expectCookieCleared(response: request.Response): void {
	const setCookie = readSetCookie(response, sessionCookie.name) ?? "";
	expect(setCookie).toContain(`${sessionCookie.name}=;`);
	expect(setCookie).toContain("Expires=Thu, 01 Jan 1970 00:00:00 GMT");
	// Sans ces attributs, le navigateur refuserait d'effacer un cookie __Host-
	expect(setCookie).toContain("; Path=/;");
	expect(setCookie).toContain("; Secure");
}

describe("logout", () => {
	describe("204 No Content", () => {
		it("SHOULD delete the session and clear the cookie WHEN the browser is connected", async () => {
			// Arrange
			const session = await openTestSession();

			// Act
			const response = await logout(session.cookie);

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.NO_CONTENT);
			expectCookieCleared(response);
			expect(
				await selectAuthRows.rowIdsByUserId("auth_session", session.userId),
			).toStrictEqual([]);
		});

		it("SHOULD make the token useless at once WHEN the session is deleted", async () => {
			// Arrange
			const session = await openTestSession();
			await logout(session.cookie);

			// Act
			const response = await request(app)
				.get(`${ApiPrefixEnum.AUTH}/me`)
				.set("Cookie", session.cookie);

			// Assert
			expect(response.status).toBe(
				HttpStatutCodeErrorEnum.NEED_AUTHENTIFICATION,
			);
		});

		it("SHOULD answer the same WHEN the browser logs out twice", async () => {
			// Arrange
			const session = await openTestSession();
			await logout(session.cookie);

			// Act
			const response = await logout(session.cookie);

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.NO_CONTENT);
			expectCookieCleared(response);
		});

		it("SHOULD answer the same WHEN the browser has no cookie", async () => {
			// Act
			const response = await logout();

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.NO_CONTENT);
			expectCookieCleared(response);
		});

		it("SHOULD keep the other sessions of the account WHEN one browser logs out", async () => {
			// Arrange
			const session = await openTestSession();
			const phoneSession = await openTestSession({ userId: session.userId });

			// Act
			await logout(session.cookie);

			// Assert
			const phoneResponse = await request(app)
				.get(`${ApiPrefixEnum.AUTH}/me`)
				.set("Cookie", phoneSession.cookie);
			expect(phoneResponse.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
		});
	});

	describe("500 Internal Server Error", () => {
		it("SHOULD answer a generic error and log it WHEN deleting the session fails", async () => {
			// Arrange
			const session = await openTestSession();
			const errorLogWatcher = await watchErrorLogs();
			vi.spyOn(Session, "destroy").mockRejectedValueOnce(
				simulatedDatabaseFailure(),
			);

			// Act
			const response = await logout(session.cookie);

			// Assert
			expectInternalServerError(response);
			await errorLogWatcher.expectLogged({
				errorType: "DatabaseError",
				message: `[POST ${LOGOUT_URL}] Failed to delete session`,
			});
		});
	});
});
