import type { MeDto } from "@citadel/specs/src/projects/auth/dto/meDto.type.ts";
import { LoginMethodEnum } from "@citadel/specs/src/projects/auth/enum/loginMethod.enum.ts";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum.ts";
import { TechnicalErrorCodeEnum } from "@citadel/specs/src/specUtils/error/technicalErrorCode.enum.ts";
import { HttpStatutCodeErrorEnum } from "@citadel/specs/src/specUtils/httpStatutCodeError.enum.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";
import request from "supertest";
import { describe, expect, it, vi } from "vitest";

import { app } from "../../../../app.ts";
import { useFakeClock } from "../../../../testUtils/clock/useFakeClock.ts";
import { openTestSession } from "../../../../testUtils/integration/auth/openTestSession.ts";
import { readSetCookie } from "../../../../testUtils/integration/auth/readSetCookie.ts";
import { selectAuthRows } from "../../../../testUtils/integration/auth/selectAuthRows.ts";
import { expectInternalServerError } from "../../../../testUtils/integration/expectInternalServerError.ts";
import { simulatedDatabaseFailure } from "../../../../testUtils/integration/simulatedDatabaseFailure.ts";
import { watchErrorLogs } from "../../../../testUtils/integration/watchErrorLogs.ts";
import { sessionCookie } from "../../cookie/sessionCookie.ts";
import { Session } from "../../models/Session.ts";

const GET_ME_URL = `${ApiPrefixEnum.AUTH}/me`;
const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

async function getMe(cookie?: string) {
	const pending = request(app).get(GET_ME_URL);
	return cookie === undefined ? pending : pending.set("Cookie", cookie);
}

async function readOnlySession(userId: number) {
	const [sessionId] = await selectAuthRows.rowIdsByUserId(
		"auth_session",
		userId,
	);
	return selectAuthRows.session(sessionId ?? 0);
}

function expectAuthenticationRequired(response: request.Response): void {
	expect(response.status).toBe(HttpStatutCodeErrorEnum.NEED_AUTHENTIFICATION);
	expect(response.body).toStrictEqual({
		code: TechnicalErrorCodeEnum.AUTHENTICATION_REQUIRED,
		message: "A valid session is required",
	});
}

describe("getMe", () => {
	describe("200 OK", () => {
		it("SHOULD return the connected account, never cached WHEN the session is valid", async () => {
			// Arrange
			const session = await openTestSession();
			const user = await selectAuthRows.user(session.userId);

			// Act
			const response = await getMe(session.cookie);

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
			expect(response.headers["cache-control"]).toBe("no-store");
			expect(response.body as MeDto).toStrictEqual({
				email: user?.email,
				username: user?.username,
				displayName: null,
				loginMethods: LoginMethodEnum.BOTH,
			});
		});

		it("SHOULD neither write nor resend the cookie WHEN the last visit is less than 5 minutes old", async () => {
			// Arrange
			const clock = useFakeClock();
			const session = await openTestSession({ remember: true });
			const before = await readOnlySession(session.userId);
			clock.advance(4 * MINUTE_MS);

			// Act
			const response = await getMe(session.cookie);

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
			expect(readSetCookie(response, sessionCookie.name)).toBeUndefined();
			expect(await readOnlySession(session.userId)).toStrictEqual(before);
		});

		it("SHOULD push the end back 7 days and resend the cookie WHEN a remembered session is 5 minutes old", async () => {
			// Arrange
			const clock = useFakeClock();
			const session = await openTestSession({ remember: true });
			clock.advance(6 * MINUTE_MS);
			const now = new Date();

			// Act
			const response = await getMe(session.cookie);

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
			const setCookie = readSetCookie(response, sessionCookie.name);
			expect(setCookie).toContain(`${sessionCookie.name}=${session.token};`);
			expect(setCookie).toContain("Max-Age=604800;");
			const sessionRow = await readOnlySession(session.userId);
			expect(sessionRow?.lastSeenAt).toStrictEqual(now);
			expect(sessionRow?.expiresAt).toStrictEqual(
				new Date(now.getTime() + 7 * DAY_MS),
			);
			expect((await selectAuthRows.user(session.userId))?.lastSeenAt).toEqual(
				now,
			);
		});

		it("SHOULD push the end back 12 hours without resending the cookie WHEN a browser session is 5 minutes old", async () => {
			// Arrange
			const clock = useFakeClock();
			const session = await openTestSession();
			clock.advance(6 * MINUTE_MS);
			const now = new Date();

			// Act
			const response = await getMe(session.cookie);

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
			expect(readSetCookie(response, sessionCookie.name)).toBeUndefined();
			expect((await readOnlySession(session.userId))?.expiresAt).toStrictEqual(
				new Date(now.getTime() + 12 * HOUR_MS),
			);
		});

		it("SHOULD set a host-only, HttpOnly, Secure, SameSite=Lax cookie WHEN the cookie is resent", async () => {
			// Arrange
			const clock = useFakeClock();
			const session = await openTestSession({ remember: true });
			clock.advance(6 * MINUTE_MS);

			// Act
			const response = await getMe(session.cookie);

			// Assert
			const setCookie = readSetCookie(response, sessionCookie.name) ?? "";
			expect(sessionCookie.name).toBe("__Host-citadel_session");
			expect(setCookie).toContain("; Path=/;");
			expect(setCookie).toContain("; HttpOnly");
			expect(setCookie).toContain("; Secure");
			expect(setCookie).toContain("; SameSite=Lax");
			expect(setCookie).not.toContain("Domain=");
		});

		it("SHOULD shorten the cookie to the cap WHEN fewer than 7 days remain before it", async () => {
			// Arrange
			const clock = useFakeClock();
			const session = await openTestSession({ remember: true });
			for (let week = 1; week <= 4; week++) {
				clock.advance(6 * DAY_MS);
				// eslint-disable-next-line no-await-in-loop
				await getMe(session.cookie);
			}
			clock.advance(DAY_MS);

			// Act
			const response = await getMe(session.cookie);

			// Assert : 25 jours après la connexion, il en reste 5 avant le plafond
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
			expect(readSetCookie(response, sessionCookie.name)).toContain(
				`Max-Age=${5 * 24 * 60 * 60};`,
			);
		});
	});

	describe("401 Unauthorized", () => {
		it("SHOULD refuse WHEN the request has no cookie", async () => {
			expectAuthenticationRequired(await getMe());
		});

		it("SHOULD refuse WHEN the cookie is empty", async () => {
			expectAuthenticationRequired(await getMe(`${sessionCookie.name}=`));
		});

		it("SHOULD refuse WHEN the token was altered", async () => {
			// Arrange
			const session = await openTestSession();
			const lastCharacter = session.token.endsWith("A") ? "B" : "A";
			const alteredToken = `${session.token.slice(0, -1)}${lastCharacter}`;

			// Act
			const response = await getMe(`${sessionCookie.name}=${alteredToken}`);

			// Assert
			expectAuthenticationRequired(response);
		});

		it("SHOULD refuse WHEN a browser session stayed idle 12 hours", async () => {
			// Arrange
			const clock = useFakeClock();
			const session = await openTestSession();
			clock.advance(12 * HOUR_MS);

			// Act
			const response = await getMe(session.cookie);

			// Assert
			expectAuthenticationRequired(response);
		});

		it("SHOULD refuse WHEN a remembered session stayed idle 7 days", async () => {
			// Arrange
			const clock = useFakeClock();
			const session = await openTestSession({ remember: true });
			clock.advance(7 * DAY_MS);

			// Act
			const response = await getMe(session.cookie);

			// Assert
			expectAuthenticationRequired(response);
		});

		it("SHOULD refuse WHEN a session used every 6 days reaches 30 days", async () => {
			// Arrange
			const clock = useFakeClock();
			const session = await openTestSession({ remember: true });
			for (let week = 1; week <= 4; week++) {
				clock.advance(6 * DAY_MS);
				// eslint-disable-next-line no-await-in-loop
				expect((await getMe(session.cookie)).status).toBe(
					HttpStatutCodeSuccessEnum.SUCCESS,
				);
			}
			clock.advance(6 * DAY_MS);

			// Act
			const response = await getMe(session.cookie);

			// Assert
			expectAuthenticationRequired(response);
		});
	});

	describe("500 Internal Server Error", () => {
		it("SHOULD answer a generic error and log it WHEN reading the session fails", async () => {
			// Arrange
			const session = await openTestSession();
			const errorLogWatcher = await watchErrorLogs();
			vi.spyOn(Session, "findOne").mockRejectedValueOnce(
				simulatedDatabaseFailure(),
			);

			// Act
			const response = await getMe(session.cookie);

			// Assert
			expectInternalServerError(response);
			await errorLogWatcher.expectLogged({
				errorType: "DatabaseError",
				message: `[GET ${GET_ME_URL}] Failed to fetch session`,
			});
		});
	});
});
