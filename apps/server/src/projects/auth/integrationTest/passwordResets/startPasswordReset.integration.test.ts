import type { FlowStatusDto } from "@citadel/specs/src/projects/auth/dto/flowStatusDto.type.ts";
import { FlowKindEnum } from "@citadel/specs/src/projects/auth/enum/flowKind.enum.ts";
import { FlowStepEnum } from "@citadel/specs/src/projects/auth/enum/flowStep.enum.ts";
import { AuthErrorCodeEnum } from "@citadel/specs/src/projects/auth/error/authErrorCode.enum.ts";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum.ts";
import { HttpStatutCodeErrorEnum } from "@citadel/specs/src/specUtils/httpStatutCodeError.enum.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";
import request from "supertest";
import { describe, expect, it, vi } from "vitest";

import { app } from "../../../../app.ts";
import { MailKindEnum } from "../../../../mail/mailKind.enum.ts";
import { mailService } from "../../../../mail/mailService.ts";
import { useFakeClock } from "../../../../testUtils/clock/useFakeClock.ts";
import { insertTestAccount } from "../../../../testUtils/integration/auth/insertTestAccount.ts";
import { watchSentMails } from "../../../../testUtils/integration/auth/watchSentMails.ts";
import { buildUniqueIp } from "../../../../testUtils/integration/buildUniqueIp.ts";

const START_PASSWORD_RESET_URL = `${ApiPrefixEnum.AUTH}/password-resets`;

async function startPasswordReset(identifier: string) {
	return request(app)
		.post(START_PASSWORD_RESET_URL)
		.set("X-Real-IP", buildUniqueIp())
		.send({ identifier });
}

const PENDING_RESET: FlowStatusDto = {
	flow: {
		kind: FlowKindEnum.PASSWORD_RESET,
		step: FlowStepEnum.MAIL_CODE,
		expiresIn: 900,
		resendRetryAfter: 60,
		remainingAttempts: 5,
	},
};

describe("startPasswordReset", () => {
	describe("200 OK", () => {
		it.each([
			{ reason: "its username", loginMethods: "both" },
			{
				reason: "its username, whatever its login methods",
				loginMethods: "mail",
			},
		])(
			"SHOULD mail a link and a code to the address of the account WHEN $reason is given",
			async ({ loginMethods }) => {
				// Arrange
				useFakeClock(new Date());
				const account = await insertTestAccount({ loginMethods });
				const mails = watchSentMails();

				// Act
				const response = await startPasswordReset(account.username);

				// Assert
				expect(response.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
				expect(response.body as FlowStatusDto).toStrictEqual(PENDING_RESET);
				expect(JSON.stringify(response.body)).not.toContain(account.email);
				const mail = await mails.waitForOne();
				expect(mail).toMatchObject({
					kind: MailKindEnum.AUTH_PASSWORD_RESET,
					to: { email: account.email },
				});
			},
		);

		it("SHOULD answer exactly the same, without any mail, WHEN the identifier is unknown", async () => {
			// Arrange
			useFakeClock(new Date());
			const mails = watchSentMails();

			// Act
			const response = await startPasswordReset("personne@example.com");

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
			expect(response.body as FlowStatusDto).toStrictEqual(PENDING_RESET);
			await mails.expectNone();
		});
	});

	describe("403 Forbidden", () => {
		it("SHOULD refuse with MAIL_CLOSED WHEN the daily quota is used up", async () => {
			// Arrange
			vi.spyOn(mailService, "getStatus").mockResolvedValue({
				isRegistrationOpen: false,
				isContactOpen: false,
				isSendingOpen: false,
			});

			// Act
			const response = await startPasswordReset("personne@example.com");

			// Assert
			expect(response.status).toBe(HttpStatutCodeErrorEnum.FORBIDDEN);
			expect((response.body as { code: string }).code).toBe(
				AuthErrorCodeEnum.MAIL_CLOSED,
			);
		});
	});
});
