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
import { readCookieHeader } from "../../../../testUtils/integration/auth/readCookieHeader.ts";
import { readMailSecrets } from "../../../../testUtils/integration/auth/readMailSecrets.ts";
import { readSetCookie } from "../../../../testUtils/integration/auth/readSetCookie.ts";
import { selectAuthRows } from "../../../../testUtils/integration/auth/selectAuthRows.ts";
import { watchSentMails } from "../../../../testUtils/integration/auth/watchSentMails.ts";
import { buildUniqueIp } from "../../../../testUtils/integration/buildUniqueIp.ts";
import { buildUniqueWord } from "../../../../testUtils/integration/buildUniqueWord.ts";
import { flowCookie } from "../../cookie/flowCookie.ts";
import { sessionCookie } from "../../cookie/sessionCookie.ts";

const START_MAIL_LOGIN_URL = `${ApiPrefixEnum.AUTH}/login/mail`;
const SUBMIT_CODE_URL = `${ApiPrefixEnum.AUTH}/flow/code`;

async function startMailLogin(identifier: string, ip = buildUniqueIp()) {
	return request(app)
		.post(START_MAIL_LOGIN_URL)
		.set("X-Real-IP", ip)
		.send({ identifier, remember: true });
}

const PENDING_MAIL_LOGIN: FlowStatusDto = {
	flow: {
		kind: FlowKindEnum.MAIL_LOGIN,
		step: FlowStepEnum.MAIL_CODE,
		expiresIn: 900,
		resendRetryAfter: 60,
		remainingAttempts: 5,
	},
};

describe("startMailLogin", () => {
	describe("200 OK", () => {
		it("SHOULD mail a link and a code to the address of the account WHEN its username is given", async () => {
			// Arrange
			useFakeClock(new Date());
			const account = await insertTestAccount();
			const mails = watchSentMails();

			// Act
			const response = await startMailLogin(account.username);

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
			expect(response.body as FlowStatusDto).toStrictEqual(PENDING_MAIL_LOGIN);
			expect(readSetCookie(response, flowCookie.name)).toContain(
				"Max-Age=900;",
			);
			const mail = await mails.waitForOne();
			expect(mail).toMatchObject({
				kind: MailKindEnum.AUTH_MAIL_LOGIN,
				to: { email: account.email },
			});
		});

		it("SHOULD open a remembered session WHEN the code of the mail is typed", async () => {
			// Arrange
			const account = await insertTestAccount();
			const mails = watchSentMails();
			const started = await startMailLogin(account.email);
			const { code } = readMailSecrets(await mails.waitForOne());

			// Act
			const response = await request(app)
				.post(SUBMIT_CODE_URL)
				.set("Cookie", readCookieHeader(started, flowCookie.name) ?? "")
				.send({ code });

			// Assert
			expect(response.body as FlowStatusDto).toStrictEqual({ flow: null });
			expect(readSetCookie(response, sessionCookie.name)).toContain("Max-Age=");
		});

		it.each([
			{ reason: "the identifier is unknown", loginMethods: null },
			{
				reason: "the account only accepts passwords",
				loginMethods: "password",
			},
		])(
			"SHOULD answer exactly the same, without any mail, WHEN $reason",
			async ({ loginMethods }) => {
				// Arrange
				useFakeClock(new Date());
				const identifier =
					loginMethods === null
						? "personne-ici"
						: (await insertTestAccount({ loginMethods })).username;
				const mails = watchSentMails();

				// Act
				const response = await startMailLogin(identifier);

				// Assert
				expect(response.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
				expect(response.body as FlowStatusDto).toStrictEqual(
					PENDING_MAIL_LOGIN,
				);
				expect(readSetCookie(response, flowCookie.name)).toContain(
					"Max-Age=900;",
				);
				await mails.expectNone();
			},
		);
	});

	describe("403 Forbidden", () => {
		it("SHOULD refuse with MAIL_CLOSED, for everybody, WHEN the daily quota is used up", async () => {
			// Arrange
			vi.spyOn(mailService, "getStatus").mockResolvedValue({
				isRegistrationOpen: false,
				isContactOpen: false,
				isSendingOpen: false,
			});

			// Act
			const response = await startMailLogin("personne-ici");

			// Assert
			expect(response.status).toBe(HttpStatutCodeErrorEnum.FORBIDDEN);
			expect(response.body).toStrictEqual({
				code: AuthErrorCodeEnum.MAIL_CLOSED,
				message: "The daily mail quota closed the mails of the authentication",
			});
		});
	});

	describe("429 Too Many Requests", () => {
		it("SHOULD refuse a 21st mail an hour WHEN they come from one IP", async () => {
			// Arrange
			const ip = buildUniqueIp();
			for (let index = 0; index < 20; index++)
				// eslint-disable-next-line no-await-in-loop
				await startMailLogin(`inconnu-${index}`, ip);

			// Act
			const response = await startMailLogin("inconnu-21", ip);

			// Assert
			expect(response.status).toBe(HttpStatutCodeErrorEnum.TOO_MANY_REQUESTS);
		});

		it("SHOULD count the username and the address of one account apart, like two unknown identifiers, WHEN the username used up its mails", async () => {
			// Arrange : un compteur commun dirait que ce pseudo et cette adresse vont ensemble
			const account = await insertTestAccount();
			for (let index = 0; index < 5; index++)
				// eslint-disable-next-line no-await-in-loop
				await startMailLogin(account.username);

			// Act
			const response = await startMailLogin(account.email);

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
		});

		it("SHOULD count an unknown identifier like an address WHEN it is asked 6 times an hour", async () => {
			// Arrange
			const identifier = buildUniqueWord();

			// Act
			const responses = [];
			for (let index = 0; index < 6; index++)
				// eslint-disable-next-line no-await-in-loop
				responses.push(await startMailLogin(identifier));

			// Assert
			expect(responses.at(-1)?.status).toBe(
				HttpStatutCodeErrorEnum.TOO_MANY_REQUESTS,
			);
			expect(
				await selectAuthRows.flowIdsByEmail(identifier.toLowerCase()),
			).toHaveLength(5);
		});
	});
});
