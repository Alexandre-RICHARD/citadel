import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum.ts";
import { HttpStatutCodeErrorEnum } from "@citadel/specs/src/specUtils/httpStatutCodeError.enum.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";
import request from "supertest";
import { describe, expect, it } from "vitest";

import { app } from "../../../../app.ts";
import { openSignedInAgent } from "../../../../testUtils/integration/auth/openSignedInAgent.ts";
import { openNasOwnerSession } from "../../../../testUtils/integration/backlog/nas/openNasOwnerSession.ts";
import { openUnlockedNasAgent } from "../../../../testUtils/integration/backlog/nas/openUnlockedNasAgent.ts";
import { TEST_SURVEYED_AT } from "../../../../testUtils/integration/backlog/nas/testSurveyedAt.ts";
import { writeTestSurvey } from "../../../../testUtils/integration/backlog/nas/writeTestSurvey.ts";
import { expectAuthenticationRequired } from "../../../../testUtils/integration/expectAuthenticationRequired.ts";

const STATUS_URL = `${ApiPrefixEnum.BACKLOG}/nas-status`;

describe("getNasStatus", () => {
	describe("200 OK", () => {
		it("SHOULD say the connected mode is unavailable WHEN the account is not the NAS owner", async () => {
			// Arrange
			const account = await openSignedInAgent();

			// Act
			const response = await account.agent.get(STATUS_URL);

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
			expect(response.body).toStrictEqual({
				isAvailable: false,
				isUnlocked: false,
				surveyedAt: null,
				jellyfinServerId: null,
				jellyfinPort: null,
				consolePort: null,
			});
		});

		it("SHOULD say nothing about the NAS WHEN the owner has not unlocked it", async () => {
			// Arrange
			const { cookie } = await openNasOwnerSession();

			// Act
			const response = await request(app).get(STATUS_URL).set("Cookie", cookie);

			// Assert
			expect(response.body).toMatchObject({
				isAvailable: true,
				isUnlocked: false,
				surveyedAt: null,
			});
		});

		it("SHOULD give the survey date and the ports WHEN the owner has unlocked it", async () => {
			// Arrange
			writeTestSurvey({});
			const owner = await openUnlockedNasAgent();

			// Act
			const response = await owner.agent.get(STATUS_URL);

			// Assert
			expect(response.body).toStrictEqual({
				isAvailable: true,
				isUnlocked: true,
				surveyedAt: TEST_SURVEYED_AT,
				jellyfinServerId: "server-1",
				jellyfinPort: 8096,
				consolePort: 8100,
			});
		});
	});

	describe("401 Unauthorized", () => {
		it("SHOULD refuse WHEN there is no session", async () => {
			// Act
			const response = await request(app).get(STATUS_URL);

			// Assert
			expectAuthenticationRequired(response);
			expect(response.status).toBe(
				HttpStatutCodeErrorEnum.NEED_AUTHENTIFICATION,
			);
		});
	});
});
