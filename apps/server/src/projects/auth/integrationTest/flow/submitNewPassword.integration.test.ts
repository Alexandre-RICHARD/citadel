import type { FlowStatusDto } from "@citadel/specs/src/projects/auth/dto/flowStatusDto.type.ts";
import { AuthErrorCodeEnum } from "@citadel/specs/src/projects/auth/error/authErrorCode.enum.ts";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum.ts";
import { ValidationIssueCodeEnum } from "@citadel/specs/src/specUtils/error/validationIssueCode.enum.ts";
import { HttpStatutCodeErrorEnum } from "@citadel/specs/src/specUtils/httpStatutCodeError.enum.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";
import request from "supertest";
import { describe, expect, it } from "vitest";

import { app } from "../../../../app.ts";
import { MailKindEnum } from "../../../../mail/mailKind.enum.ts";
import { insertTestAccount } from "../../../../testUtils/integration/auth/insertTestAccount.ts";
import { openTestFlow } from "../../../../testUtils/integration/auth/openTestFlow.ts";
import { openTestSession } from "../../../../testUtils/integration/auth/openTestSession.ts";
import { readSetCookie } from "../../../../testUtils/integration/auth/readSetCookie.ts";
import { selectAuthRows } from "../../../../testUtils/integration/auth/selectAuthRows.ts";
import { watchSentMails } from "../../../../testUtils/integration/auth/watchSentMails.ts";
import { flowCookie } from "../../cookie/flowCookie.ts";
import { sessionCookie } from "../../cookie/sessionCookie.ts";
import { passwordService } from "../../service/passwordService.ts";

const SUBMIT_NEW_PASSWORD_URL = `${ApiPrefixEnum.AUTH}/flow/new-password`;
const NEW_PASSWORD = "un tout nouveau mot de passe";

async function submitNewPassword(password: string, cookie?: string) {
	const pending = request(app).post(SUBMIT_NEW_PASSWORD_URL).send({ password });
	return cookie === undefined ? pending : pending.set("Cookie", cookie);
}

// Un mot de passe oublié dont le mail a été validé : il attend le nouveau mot de passe
async function openResetAtNewPassword() {
	const account = await insertTestAccount();
	const flow = await openTestFlow({
		kind: "password_reset",
		step: "new_password",
		userId: account.userId,
		email: account.email,
		hasSecrets: false,
		lastSentAt: null,
	});
	return { account, flow };
}

function expectFlowExpired(response: request.Response): void {
	expect(response.status).toBe(HttpStatutCodeErrorEnum.BAD_REQUEST);
	expect(response.body).toStrictEqual({
		code: AuthErrorCodeEnum.FLOW_EXPIRED,
		message: "No password reset waiting for a new password in this browser",
	});
}

describe("submitNewPassword", () => {
	describe("200 OK", () => {
		it("SHOULD replace the password, close every session, open this one and warn the account", async () => {
			// Arrange
			const { account, flow } = await openResetAtNewPassword();
			const phoneSession = await openTestSession({ userId: account.userId });
			const before = await selectAuthRows.user(account.userId);
			const mails = watchSentMails();

			// Act
			const response = await submitNewPassword(NEW_PASSWORD, flow.cookie);

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
			expect(response.body as FlowStatusDto).toStrictEqual({ flow: null });
			const after = await selectAuthRows.user(account.userId);
			expect(
				await passwordService.verify(NEW_PASSWORD, after?.passwordHash ?? null),
			).toBe(true);
			expect(after?.passwordChangedAt.getTime()).toBeGreaterThanOrEqual(
				before?.passwordChangedAt.getTime() ?? 0,
			);
			const sessionIds = await selectAuthRows.rowIdsByUserId(
				"auth_session",
				account.userId,
			);
			expect(sessionIds).toHaveLength(1);
			expect(
				await request(app)
					.get(`${ApiPrefixEnum.AUTH}/me`)
					.set("Cookie", phoneSession.cookie),
			).toMatchObject({
				status: HttpStatutCodeErrorEnum.NEED_AUTHENTIFICATION,
			});
			expect(readSetCookie(response, sessionCookie.name)).toBeDefined();
			expect(readSetCookie(response, flowCookie.name)).toContain(
				"Expires=Thu, 01 Jan 1970",
			);
			expect(await selectAuthRows.flow(flow.id)).toBeNull();
			expect(await mails.waitForOne()).toMatchObject({
				kind: MailKindEnum.AUTH_NOTICE_PASSWORD_CHANGED,
				to: { email: account.email },
			});
		});
	});

	describe("400 Bad Request", () => {
		it("SHOULD refuse with PASSWORD_UNCHANGED, changing nothing, WHEN the new password is the current one", async () => {
			// Arrange
			const { account, flow } = await openResetAtNewPassword();

			// Act
			const response = await submitNewPassword(account.password, flow.cookie);

			// Assert
			expect(response.status).toBe(HttpStatutCodeErrorEnum.BAD_REQUEST);
			expect(response.body).toStrictEqual({
				code: AuthErrorCodeEnum.PASSWORD_UNCHANGED,
				message: "The new password is the current one",
			});
			expect(await selectAuthRows.flow(flow.id)).not.toBeNull();
		});

		it("SHOULD refuse with FLOW_EXPIRED WHEN the mail of the reset is not validated yet", async () => {
			// Arrange
			const account = await insertTestAccount();
			const flow = await openTestFlow({
				kind: "password_reset",
				userId: account.userId,
			});

			// Act
			const response = await submitNewPassword(NEW_PASSWORD, flow.cookie);

			// Assert
			expectFlowExpired(response);
		});

		it("SHOULD refuse with FLOW_EXPIRED WHEN the browser has no flow", async () => {
			// Act
			const response = await submitNewPassword(NEW_PASSWORD);

			// Assert
			expectFlowExpired(response);
		});

		it("SHOULD refuse a new password WHEN it has 11 characters", async () => {
			// Act
			const response = await submitNewPassword("a".repeat(11));

			// Assert
			expect((response.body as { issues: unknown[] }).issues).toMatchObject([
				{
					path: ["password"],
					code: ValidationIssueCodeEnum.TOO_SHORT,
					limit: 12,
				},
			]);
		});
	});
});
