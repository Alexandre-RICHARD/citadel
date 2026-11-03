import type { FlowStatusDto } from "@citadel/specs/src/projects/auth/dto/flowStatusDto.type.ts";
import { AuthErrorCodeEnum } from "@citadel/specs/src/projects/auth/error/authErrorCode.enum.ts";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum.ts";
import { TechnicalErrorCodeEnum } from "@citadel/specs/src/specUtils/error/technicalErrorCode.enum.ts";
import { HttpStatutCodeErrorEnum } from "@citadel/specs/src/specUtils/httpStatutCodeError.enum.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";
import request from "supertest";
import { describe, expect, it, vi } from "vitest";

import { app } from "../../../../app.ts";
import { MailKindEnum } from "../../../../mail/mailKind.enum.ts";
import { mailService } from "../../../../mail/mailService.ts";
import { useFakeClock } from "../../../../testUtils/clock/useFakeClock.ts";
import { insertAuthRows } from "../../../../testUtils/integration/auth/insertAuthRows.ts";
import { insertTestAccount } from "../../../../testUtils/integration/auth/insertTestAccount.ts";
import { openTestFlow } from "../../../../testUtils/integration/auth/openTestFlow.ts";
import { readMailSecrets } from "../../../../testUtils/integration/auth/readMailSecrets.ts";
import { selectAuthRows } from "../../../../testUtils/integration/auth/selectAuthRows.ts";
import { watchSentMails } from "../../../../testUtils/integration/auth/watchSentMails.ts";
import { buildUniqueIp } from "../../../../testUtils/integration/buildUniqueIp.ts";

const RESEND_URL = `${ApiPrefixEnum.AUTH}/flow/resend`;
const SUBMIT_CODE_URL = `${ApiPrefixEnum.AUTH}/flow/code`;
const MINUTE_MS = 60 * 1000;

async function resend(cookie?: string, ip = buildUniqueIp()) {
	const pending = request(app).post(RESEND_URL).set("X-Real-IP", ip);
	return cookie === undefined ? pending : pending.set("Cookie", cookie);
}

// Un parcours dont le mail est parti il y a 2 minutes : le délai de renvoi est passé
async function openFlowReadyForResend(
	options: Parameters<typeof openTestFlow>[0] = {},
) {
	return openTestFlow({
		lastSentAt: new Date(Date.now() - 2 * MINUTE_MS),
		...options,
	});
}

describe("resendFlowMail", () => {
	describe("200 OK", () => {
		it("SHOULD mail a new code and link, make the old code worthless and reset the attempts", async () => {
			// Arrange
			const flow = await openFlowReadyForResend({ attempts: 4 });
			const mails = watchSentMails();

			// Act
			const response = await resend(flow.cookie);

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
			expect((response.body as FlowStatusDto).flow).toMatchObject({
				resendRetryAfter: 60,
				remainingAttempts: 5,
				secondFactorMethods: [],
			});
			const mail = await mails.waitForOne();
			expect(mail).toMatchObject({
				kind: MailKindEnum.AUTH_REGISTRATION,
				to: { email: flow.email },
			});
			const secrets = readMailSecrets(mail);
			expect(secrets.code).not.toBe(flow.code);
			expect((await selectAuthRows.flow(flow.id))?.sendCount).toBe(1);

			const oldCodeResponse = await request(app)
				.post(SUBMIT_CODE_URL)
				.set("Cookie", flow.cookie)
				.send({ code: flow.code });
			expect((oldCodeResponse.body as { code: string }).code).toBe(
				AuthErrorCodeEnum.INVALID_CODE,
			);
		});

		it("SHOULD answer the same without any mail WHEN the flow is a decoy", async () => {
			// Arrange
			const flow = await openFlowReadyForResend({
				kind: "password_reset",
				userId: null,
				hasSecrets: false,
				email: "inconnu",
			});
			const mails = watchSentMails();

			// Act
			const response = await resend(flow.cookie);

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
			expect((response.body as FlowStatusDto).flow).toMatchObject({
				resendRetryAfter: 60,
				remainingAttempts: 5,
				secondFactorMethods: [],
			});
			await mails.expectNone();
		});

		it("SHOULD mail the warning again WHEN the registration address already has an account", async () => {
			// Arrange
			const flow = await openFlowReadyForResend({ hasSecrets: false });
			await insertAuthRows.user({ email: flow.email });
			const mails = watchSentMails();

			// Act
			await resend(flow.cookie);

			// Assert
			const mail = await mails.waitForOne();
			expect(mail.kind).toBe(MailKindEnum.AUTH_REGISTRATION_EXISTING_ACCOUNT);
		});

		it("SHOULD mail the code of the email factor WHEN a login waits for its second factor", async () => {
			// Arrange : aucun mail encore envoyé à cette étape
			const account = await insertTestAccount({ confirmedFactorType: "email" });
			const flow = await openTestFlow({
				kind: "login",
				step: "second_factor",
				userId: account.userId,
				email: account.email,
				hasSecrets: false,
				lastSentAt: null,
			});
			const mails = watchSentMails();

			// Act
			const response = await resend(flow.cookie);

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
			expect((response.body as FlowStatusDto).flow).toMatchObject({
				step: "second_factor",
				resendRetryAfter: 60,
				secondFactorMethods: ["email"],
			});
			const mail = await mails.waitForOne();
			expect(mail).toMatchObject({
				kind: MailKindEnum.AUTH_SECOND_FACTOR,
				to: { email: account.email },
			});
			const { code } = readMailSecrets(mail);
			expect(
				(
					await request(app)
						.post(`${ApiPrefixEnum.AUTH}/flow/second-factor`)
						.set("X-Real-IP", buildUniqueIp())
						.set("Cookie", flow.cookie)
						.send({ method: "email", code })
				).status,
			).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
		});
	});

	describe("400 Bad Request", () => {
		it("SHOULD refuse with FLOW_EXPIRED WHEN the browser has no flow", async () => {
			// Act
			const response = await resend();

			// Assert
			expect(response.status).toBe(HttpStatutCodeErrorEnum.BAD_REQUEST);
			expect(response.body).toStrictEqual({
				code: AuthErrorCodeEnum.FLOW_EXPIRED,
				message: "No flow in progress in this browser",
			});
		});

		it("SHOULD refuse with FLOW_EXPIRED WHEN the step sends no mail", async () => {
			// Arrange
			const flow = await openFlowReadyForResend({
				kind: "password_reset",
				step: "new_password",
				userId: await insertAuthRows.user(),
			});

			// Act
			const response = await resend(flow.cookie);

			// Assert
			expect(response.body).toStrictEqual({
				code: AuthErrorCodeEnum.FLOW_EXPIRED,
				message: "This step of the flow sends no mail",
			});
		});

		it.each([
			{
				reason: "the account has only a TOTP",
				kind: "login",
				factor: "totp" as const,
			},
			{
				reason: "the step follows a mail login",
				kind: "mail_login",
				factor: "email" as const,
			},
		])("SHOULD send no email code WHEN $reason", async ({ kind, factor }) => {
			// Arrange
			const account = await insertTestAccount({ confirmedFactorType: factor });
			const flow = await openFlowReadyForResend({
				kind,
				step: "second_factor",
				userId: account.userId,
				email: account.email,
			});
			const mails = watchSentMails();

			// Act
			const response = await resend(flow.cookie);

			// Assert
			expect(response.body).toStrictEqual({
				code: AuthErrorCodeEnum.FLOW_EXPIRED,
				message: "This step of the flow sends no mail",
			});
			await mails.expectNone();
		});
	});

	describe("403 Forbidden", () => {
		it("SHOULD refuse with MAIL_CLOSED WHEN the daily quota closed the mails of a login", async () => {
			// Arrange
			vi.spyOn(mailService, "getStatus").mockResolvedValue({
				isRegistrationOpen: false,
				isContactOpen: false,
				isSendingOpen: false,
			});
			const flow = await openFlowReadyForResend({
				kind: "mail_login",
				userId: await insertAuthRows.user(),
			});

			// Act
			const response = await resend(flow.cookie);

			// Assert
			expect(response.status).toBe(HttpStatutCodeErrorEnum.FORBIDDEN);
			expect((response.body as { code: string }).code).toBe(
				AuthErrorCodeEnum.MAIL_CLOSED,
			);
		});

		it("SHOULD refuse with REGISTRATION_CLOSED WHEN the quota closed registrations only", async () => {
			// Arrange
			vi.spyOn(mailService, "getStatus").mockResolvedValue({
				isRegistrationOpen: false,
				isContactOpen: true,
				isSendingOpen: true,
			});
			const flow = await openFlowReadyForResend();

			// Act
			const response = await resend(flow.cookie);

			// Assert
			expect((response.body as { code: string }).code).toBe(
				AuthErrorCodeEnum.REGISTRATION_CLOSED,
			);
		});
	});

	describe("429 Too Many Requests", () => {
		it("SHOULD make the browser wait the rest of the 60 seconds WHEN the mail left 20 seconds ago", async () => {
			// Arrange
			const clock = useFakeClock();
			const flow = await openTestFlow({ lastSentAt: new Date() });
			clock.advance(20 * 1000);

			// Act
			const response = await resend(flow.cookie);

			// Assert
			expect(response.status).toBe(HttpStatutCodeErrorEnum.TOO_MANY_REQUESTS);
			expect(response.headers["retry-after"]).toBe("40");
			expect(response.body).toStrictEqual({
				code: TechnicalErrorCodeEnum.TOO_MANY_REQUESTS,
				message: "The mail was sent too recently",
			});
		});
	});
});
