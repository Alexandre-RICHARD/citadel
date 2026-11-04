import type { SessionListDto } from "@citadel/specs/src/projects/auth/dto/sessionListDto.type.ts";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum.ts";
import { HttpStatutCodeErrorEnum } from "@citadel/specs/src/specUtils/httpStatutCodeError.enum.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";
import request from "supertest";
import { describe, expect, it } from "vitest";

import { app } from "../../../../app.ts";
import { useFakeClock } from "../../../../testUtils/clock/useFakeClock.ts";
import { isSessionOpen } from "../../../../testUtils/integration/auth/isSessionOpen.ts";
import { openAccountWithTwoSessions } from "../../../../testUtils/integration/auth/openAccountWithTwoSessions.ts";
import { openTestSession } from "../../../../testUtils/integration/auth/openTestSession.ts";

const LIST_SESSIONS_URL = `${ApiPrefixEnum.AUTH}/sessions`;
const HOUR_MS = 60 * 60 * 1000;

describe("listSessions", () => {
	describe("200 OK", () => {
		it("SHOULD list the sessions of the account, mark the current one and never cache", async () => {
			// Arrange
			const { here, phone } = await openAccountWithTwoSessions();
			await openTestSession();

			// Act
			const response = await request(app)
				.get(LIST_SESSIONS_URL)
				.set("Cookie", here.cookie);

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
			expect(response.headers["cache-control"]).toBe("no-store");
			const { sessions } = response.body as SessionListDto;
			expect(sessions).toHaveLength(2);
			expect(sessions.filter((session) => session.isCurrent)).toHaveLength(1);
			expect(sessions[0]).toMatchObject({
				browser: null,
				system: null,
				ip: "203.0.113.0/24",
			});
			expect(await isSessionOpen(phone.cookie)).toBe(true);
		});

		it("SHOULD leave out a session that expired but is not purged yet", async () => {
			// Arrange
			const clock = useFakeClock();
			const old = await openTestSession();
			clock.advance(11 * HOUR_MS);
			const here = await openTestSession({ userId: old.userId });
			clock.advance(2 * HOUR_MS);

			// Act
			const response = await request(app)
				.get(LIST_SESSIONS_URL)
				.set("Cookie", here.cookie);

			// Assert
			expect((response.body as SessionListDto).sessions).toHaveLength(1);
		});
	});

	describe("401 Unauthorized", () => {
		it("SHOULD refuse WHEN the request has no session", async () => {
			// Act
			const response = await request(app).get(LIST_SESSIONS_URL);

			// Assert
			expect(response.status).toBe(
				HttpStatutCodeErrorEnum.NEED_AUTHENTIFICATION,
			);
		});
	});
});
