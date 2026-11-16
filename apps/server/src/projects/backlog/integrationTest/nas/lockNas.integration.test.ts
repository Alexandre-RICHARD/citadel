import { BacklogErrorCodeEnum } from "@citadel/specs/src/projects/backlog/error/backlogErrorCode.enum.ts";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum.ts";
import { HttpStatutCodeErrorEnum } from "@citadel/specs/src/specUtils/httpStatutCodeError.enum.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";
import request from "supertest";
import { describe, expect, it } from "vitest";

import { app } from "../../../../app.ts";
import { unlockCookie } from "../../../../projects/backlog/nas/access/unlockCookie.ts";
import { readSetCookie } from "../../../../testUtils/integration/auth/readSetCookie.ts";
import { openUnlockedNasAgent } from "../../../../testUtils/integration/backlog/nas/openUnlockedNasAgent.ts";
import { writeTestSurvey } from "../../../../testUtils/integration/backlog/nas/writeTestSurvey.ts";

describe("lockNas", () => {
	describe("204 No Content", () => {
		it("SHOULD clear the unlock cookie", async () => {
			// Arrange
			writeTestSurvey({});
			const owner = await openUnlockedNasAgent();

			// Act
			const response = await owner.agent.post(
				`${ApiPrefixEnum.BACKLOG}/nas/lock`,
			);

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.NO_CONTENT);
			expect(readSetCookie(response, unlockCookie.name)).toMatch(
				/Expires=Thu, 01 Jan 1970/,
			);
			const locked = await request(app)
				.get(`${ApiPrefixEnum.BACKLOG}/nas/user-media`)
				.set("Cookie", owner.sessionCookie);
			expect(locked.status).toBe(HttpStatutCodeErrorEnum.FORBIDDEN);
			expect(locked.body).toMatchObject({
				code: BacklogErrorCodeEnum.NAS_LOCKED,
			});
		});
	});
});
