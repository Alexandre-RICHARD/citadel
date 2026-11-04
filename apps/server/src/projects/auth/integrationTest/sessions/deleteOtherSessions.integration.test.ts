import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum.ts";
import { HttpStatutCodeErrorEnum } from "@citadel/specs/src/specUtils/httpStatutCodeError.enum.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";
import request from "supertest";
import { describe, expect, it } from "vitest";

import { app } from "../../../../app.ts";
import { isSessionOpen } from "../../../../testUtils/integration/auth/isSessionOpen.ts";
import { openAccountWithTwoSessions } from "../../../../testUtils/integration/auth/openAccountWithTwoSessions.ts";
import { openTestSession } from "../../../../testUtils/integration/auth/openTestSession.ts";

const DELETE_OTHER_SESSIONS_URL = `${ApiPrefixEnum.AUTH}/sessions/others`;

describe("deleteOtherSessions", () => {
	describe("204 No Content", () => {
		it("SHOULD disconnect every other session of the account and keep this one", async () => {
			// Arrange
			const { here, phone } = await openAccountWithTwoSessions();
			const stranger = await openTestSession();

			// Act
			const response = await request(app)
				.delete(DELETE_OTHER_SESSIONS_URL)
				.set("Cookie", here.cookie);

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.NO_CONTENT);
			expect(await isSessionOpen(phone.cookie)).toBe(false);
			expect(await isSessionOpen(here.cookie)).toBe(true);
			expect(await isSessionOpen(stranger.cookie)).toBe(true);
		});
	});

	describe("401 Unauthorized", () => {
		it("SHOULD refuse WHEN the request has no session", async () => {
			// Act
			const response = await request(app).delete(DELETE_OTHER_SESSIONS_URL);

			// Assert
			expect(response.status).toBe(
				HttpStatutCodeErrorEnum.NEED_AUTHENTIFICATION,
			);
		});
	});
});
