import type { MailStatusDto } from "@citadel/specs/src/projects/mail/dto/mailStatusDto.type.ts";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";
import request from "supertest";
import { describe, expect, it, vi } from "vitest";

import { app } from "../../../../app.ts";
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
	});
});
