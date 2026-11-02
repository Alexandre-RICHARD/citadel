import type { MailStatusDto } from "@citadel/specs/src/projects/mail/dto/mailStatusDto.type.ts";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";
import request from "supertest";
import { describe, expect, it, onTestFinished, vi } from "vitest";

import { app } from "../../../../app.ts";
import { authSettings } from "../../../../configuration/authSettings.ts";
import { mailService } from "../../../../mail/mailService.ts";

const GET_MAIL_STATUS_URL = `${ApiPrefixEnum.MAIL}/status`;

describe("getMailStatus", () => {
	describe("200 OK", () => {
		it("SHOULD say everything is open, never cached, WHEN few mails left today", async () => {
			// Act
			const response = await request(app).get(GET_MAIL_STATUS_URL);

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
			expect(response.headers["cache-control"]).toBe("no-store");
			expect(response.body as MailStatusDto).toStrictEqual({
				isRegistrationOpen: true,
				isContactOpen: true,
				isSendingOpen: true,
			});
		});

		it("SHOULD say what the quota closed WHEN a threshold is reached", async () => {
			// Arrange
			const closedStatus = {
				isRegistrationOpen: false,
				isContactOpen: false,
				isSendingOpen: true,
			};
			vi.spyOn(mailService, "getStatus").mockResolvedValueOnce(closedStatus);

			// Act
			const response = await request(app).get(GET_MAIL_STATUS_URL);

			// Assert
			expect(response.body as MailStatusDto).toStrictEqual(closedStatus);
		});

		it("SHOULD say registrations are closed, the rest open, WHEN the emergency switch is off", async () => {
			// Arrange
			authSettings.isRegistrationEnabled = false;
			onTestFinished(() => {
				authSettings.isRegistrationEnabled = true;
			});

			// Act
			const response = await request(app).get(GET_MAIL_STATUS_URL);

			// Assert
			expect(response.body as MailStatusDto).toStrictEqual({
				isRegistrationOpen: false,
				isContactOpen: true,
				isSendingOpen: true,
			});
		});
	});
});
