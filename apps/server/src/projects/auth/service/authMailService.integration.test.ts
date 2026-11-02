import { AuthErrorCodeEnum } from "@citadel/specs/src/projects/auth/error/authErrorCode.enum.ts";
import { MailErrorCodeEnum } from "@citadel/specs/src/projects/mail/error/mailErrorCode.enum.ts";
import { describe, expect, it, vi } from "vitest";

import { BadGatewayError } from "../../../error/BadGatewayError.ts";
import { ForbiddenError } from "../../../error/ForbiddenError.ts";
import { MailKindEnum } from "../../../mail/mailKind.enum.ts";
import { mailService } from "../../../mail/mailService.ts";
import { memoryMailSender } from "../../../mail/sender/memoryMailSender.ts";
import { countTableRows } from "../../../testUtils/integration/countTableRows.ts";
import { watchErrorLogs } from "../../../testUtils/integration/watchErrorLogs.ts";
import { buildSecurityNoticeMail } from "../template/buildSecurityNoticeMail.ts";
import { authMailService } from "./authMailService.ts";

const MAIL = buildSecurityNoticeMail(
	MailKindEnum.AUTH_NOTICE_PASSWORD_CHANGED,
	"sam@example.com",
);

describe("authMailService", () => {
	describe("assertSendingOpen", () => {
		it("SHOULD resolve WHEN the daily quota still lets mails go", async () => {
			await expect(
				authMailService.assertSendingOpen(),
			).resolves.toBeUndefined();
		});

		it("SHOULD refuse with MAIL_CLOSED WHEN the daily quota is used up", async () => {
			// Arrange
			vi.spyOn(mailService, "getStatus").mockResolvedValueOnce({
				isRegistrationOpen: false,
				isContactOpen: false,
				isSendingOpen: false,
			});

			// Act
			const check = authMailService.assertSendingOpen();

			// Assert
			await expect(check).rejects.toStrictEqual(
				new ForbiddenError(
					AuthErrorCodeEnum.MAIL_CLOSED,
					"The daily mail quota closed the mails of the authentication",
				),
			);
		});
	});

	describe("sendWithoutWaiting", () => {
		it("SHOULD send the mail WHEN the sender works", async () => {
			// Arrange
			const sentBefore = memoryMailSender.sentMails.length;

			// Act
			authMailService.sendWithoutWaiting(MAIL);

			// Assert
			await vi.waitFor(() => {
				expect(memoryMailSender.sentMails.slice(sentBefore)).toStrictEqual([
					MAIL,
				]);
			});
		});

		it("SHOULD record the failure and log it, without throwing, WHEN the sender fails", async () => {
			// Arrange
			const { expectLogged } = await watchErrorLogs();
			const failuresBefore = await countTableRows("mailing_failure");
			vi.spyOn(memoryMailSender, "send").mockRejectedValueOnce(
				new BadGatewayError(
					MailErrorCodeEnum.MAIL_UNAVAILABLE,
					"Brevo refused the auth-notice-password-changed mail (400, no code)",
				),
			);

			// Act et Assert
			expect(() => {
				authMailService.sendWithoutWaiting(MAIL);
			}).not.toThrow();
			await expectLogged({
				errorType: "BadGatewayError",
				message:
					"[Mail d'authentification auth-notice-password-changed] Brevo refused the auth-notice-password-changed mail (400, no code)",
			});
			expect(await countTableRows("mailing_failure")).toBe(failuresBefore + 1);
		});
	});
});
