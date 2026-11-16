import { BacklogErrorCodeEnum } from "@citadel/specs/src/projects/backlog/error/backlogErrorCode.enum.ts";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum.ts";
import { TechnicalErrorCodeEnum } from "@citadel/specs/src/specUtils/error/technicalErrorCode.enum.ts";
import { HttpStatutCodeErrorEnum } from "@citadel/specs/src/specUtils/httpStatutCodeError.enum.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";
import request from "supertest";
import { describe, expect, it } from "vitest";

import { app } from "../../../../app.ts";
import { unlockCookie } from "../../../../projects/backlog/nas/access/unlockCookie.ts";
import { openSignedInAgent } from "../../../../testUtils/integration/auth/openSignedInAgent.ts";
import { readSetCookie } from "../../../../testUtils/integration/auth/readSetCookie.ts";
import { NAS_TEST_PASSWORD } from "../../../../testUtils/integration/backlog/nas/nasTestPassword.ts";
import { openNasOwnerSession } from "../../../../testUtils/integration/backlog/nas/openNasOwnerSession.ts";
import { buildUniqueIp } from "../../../../testUtils/integration/buildUniqueIp.ts";

const UNLOCK_URL = `${ApiPrefixEnum.BACKLOG}/nas/unlock`;
const TWELVE_HOURS_SECONDS = 12 * 60 * 60;

function unlock(cookie: string, password: string, ip: string) {
	return request(app)
		.post(UNLOCK_URL)
		.set("Cookie", cookie)
		.set("X-Real-IP", ip)
		.send({ password });
}

describe("unlockNas", () => {
	describe("204 No Content", () => {
		it("SHOULD set a 12 hour strict cookie WHEN the owner gives the media password", async () => {
			// Arrange
			const { cookie } = await openNasOwnerSession();

			// Act
			const response = await unlock(cookie, NAS_TEST_PASSWORD, buildUniqueIp());

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.NO_CONTENT);
			const setCookie = readSetCookie(response, unlockCookie.name) ?? "";
			expect(setCookie).toContain(`Max-Age=${TWELVE_HOURS_SECONDS}`);
			expect(setCookie).toContain("HttpOnly");
			expect(setCookie).toContain("SameSite=Strict");
		});
	});

	describe("401 Unauthorized", () => {
		it("SHOULD refuse WHEN the media password is wrong", async () => {
			// Arrange
			const { cookie } = await openNasOwnerSession();

			// Act
			const response = await unlock(cookie, "pas le bon", buildUniqueIp());

			// Assert
			expect(response.status).toBe(
				HttpStatutCodeErrorEnum.NEED_AUTHENTIFICATION,
			);
			expect(response.body).toStrictEqual({
				code: BacklogErrorCodeEnum.MEDIA_PASSWORD_INVALID,
				message: "Wrong media password",
			});
			expect(readSetCookie(response, unlockCookie.name)).toBeUndefined();
		});
	});

	describe("403 Forbidden", () => {
		it("SHOULD refuse WHEN the account is not the NAS owner, even with the right password", async () => {
			// Arrange
			const account = await openSignedInAgent();

			// Act
			const response = await account.agent
				.post(UNLOCK_URL)
				.set("X-Real-IP", buildUniqueIp())
				.send({ password: NAS_TEST_PASSWORD });

			// Assert
			expect(response.status).toBe(HttpStatutCodeErrorEnum.FORBIDDEN);
			expect(response.body).toStrictEqual({
				code: BacklogErrorCodeEnum.NAS_OWNER_ONLY,
				message: "Only the NAS owner can use the connected mode",
			});
		});
	});

	describe("429 Too Many Requests", () => {
		it("SHOULD refuse even the right password WHEN the address has failed five times", async () => {
			// Arrange
			const { cookie } = await openNasOwnerSession();
			const ip = buildUniqueIp();
			for (let attempt = 0; attempt < 5; attempt += 1)
				// eslint-disable-next-line no-await-in-loop -- les essais se comptent un par un
				await unlock(cookie, "pas le bon", ip);

			// Act
			const response = await unlock(cookie, NAS_TEST_PASSWORD, ip);

			// Assert
			expect(response.status).toBe(HttpStatutCodeErrorEnum.TOO_MANY_REQUESTS);
			expect(response.body).toMatchObject({
				code: TechnicalErrorCodeEnum.TOO_MANY_REQUESTS,
			});
		});
	});
});
