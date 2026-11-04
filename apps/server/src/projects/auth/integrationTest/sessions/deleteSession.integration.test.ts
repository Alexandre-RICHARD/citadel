import type { SessionListDto } from "@citadel/specs/src/projects/auth/dto/sessionListDto.type.ts";
import { AuthErrorCodeEnum } from "@citadel/specs/src/projects/auth/error/authErrorCode.enum.ts";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum.ts";
import { HttpStatutCodeErrorEnum } from "@citadel/specs/src/specUtils/httpStatutCodeError.enum.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";
import request from "supertest";
import { describe, expect, it } from "vitest";

import { app } from "../../../../app.ts";
import { isSessionOpen } from "../../../../testUtils/integration/auth/isSessionOpen.ts";
import { openAccountWithTwoSessions } from "../../../../testUtils/integration/auth/openAccountWithTwoSessions.ts";
import { openTestSession } from "../../../../testUtils/integration/auth/openTestSession.ts";
import { readSetCookie } from "../../../../testUtils/integration/auth/readSetCookie.ts";
import { selectAuthRows } from "../../../../testUtils/integration/auth/selectAuthRows.ts";
import { sessionCookie } from "../../cookie/sessionCookie.ts";

const SESSIONS_URL = `${ApiPrefixEnum.AUTH}/sessions`;

describe("deleteSession", () => {
	describe("204 No Content", () => {
		it("SHOULD disconnect only the chosen session of the account", async () => {
			// Arrange
			const { here, phone } = await openAccountWithTwoSessions();
			const phoneSessionId = (
				await selectAuthRows.rowIdsByUserId("auth_session", here.userId)
			).at(-1);

			// Act
			const response = await request(app)
				.delete(`${SESSIONS_URL}/${phoneSessionId}`)
				.set("Cookie", here.cookie);

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.NO_CONTENT);
			expect(readSetCookie(response, sessionCookie.name)).toBeUndefined();
			expect(await isSessionOpen(phone.cookie)).toBe(false);
			expect(await isSessionOpen(here.cookie)).toBe(true);
		});

		it("SHOULD clear the cookie WHEN the chosen session is the current one", async () => {
			// Arrange
			const { here } = await openAccountWithTwoSessions();
			const currentId = (
				(await request(app).get(SESSIONS_URL).set("Cookie", here.cookie))
					.body as SessionListDto
			).sessions.find((session) => session.isCurrent)?.id;

			// Act
			const response = await request(app)
				.delete(`${SESSIONS_URL}/${currentId}`)
				.set("Cookie", here.cookie);

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.NO_CONTENT);
			expect(readSetCookie(response, sessionCookie.name)).toContain(
				`${sessionCookie.name}=;`,
			);
			expect(await isSessionOpen(here.cookie)).toBe(false);
		});
	});

	describe("400 Bad Request", () => {
		it("SHOULD refuse WHEN the id is not a number", async () => {
			// Arrange
			const { here } = await openAccountWithTwoSessions();

			// Act
			const response = await request(app)
				.delete(`${SESSIONS_URL}/abc`)
				.set("Cookie", here.cookie);

			// Assert
			expect(response.status).toBe(HttpStatutCodeErrorEnum.BAD_REQUEST);
		});
	});

	describe("401 Unauthorized", () => {
		it("SHOULD refuse WHEN the request has no session", async () => {
			// Act
			const response = await request(app).delete(`${SESSIONS_URL}/1`);

			// Assert
			expect(response.status).toBe(
				HttpStatutCodeErrorEnum.NEED_AUTHENTIFICATION,
			);
		});
	});

	describe("404 Not Found", () => {
		it("SHOULD never disconnect the session of another account", async () => {
			// Arrange
			const { here } = await openAccountWithTwoSessions();
			const stranger = await openTestSession();
			const [strangerSessionId] = await selectAuthRows.rowIdsByUserId(
				"auth_session",
				stranger.userId,
			);

			// Act
			const response = await request(app)
				.delete(`${SESSIONS_URL}/${strangerSessionId}`)
				.set("Cookie", here.cookie);

			// Assert
			expect(response.status).toBe(HttpStatutCodeErrorEnum.NOT_FOUND);
			expect(response.body).toStrictEqual({
				code: AuthErrorCodeEnum.SESSION_NOT_FOUND,
				message: "No session of this account has this id",
			});
			expect(await isSessionOpen(stranger.cookie)).toBe(true);
		});
	});
});
