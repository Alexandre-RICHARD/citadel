import type { FlowStatusDto } from "@citadel/specs/src/projects/auth/dto/flowStatusDto.type.ts";
import type { StartRegistrationBodyDto } from "@citadel/specs/src/projects/auth/endpoint/registrations/startRegistration/startRegistrationBodyDto.type.ts";
import { FlowKindEnum } from "@citadel/specs/src/projects/auth/enum/flowKind.enum.ts";
import { FlowStepEnum } from "@citadel/specs/src/projects/auth/enum/flowStep.enum.ts";
import { AuthErrorCodeEnum } from "@citadel/specs/src/projects/auth/error/authErrorCode.enum.ts";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum.ts";
import { TechnicalErrorCodeEnum } from "@citadel/specs/src/specUtils/error/technicalErrorCode.enum.ts";
import { ValidationIssueCodeEnum } from "@citadel/specs/src/specUtils/error/validationIssueCode.enum.ts";
import { HttpStatutCodeErrorEnum } from "@citadel/specs/src/specUtils/httpStatutCodeError.enum.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";
import request from "supertest";
import { describe, expect, it, onTestFinished, vi } from "vitest";

import { app } from "../../../../app.ts";
import { authSettings } from "../../../../configuration/authSettings.ts";
import { MailKindEnum } from "../../../../mail/mailKind.enum.ts";
import { mailService } from "../../../../mail/mailService.ts";
import { useFakeClock } from "../../../../testUtils/clock/useFakeClock.ts";
import { insertAuthRows } from "../../../../testUtils/integration/auth/insertAuthRows.ts";
import { readCookieHeader } from "../../../../testUtils/integration/auth/readCookieHeader.ts";
import { readSetCookie } from "../../../../testUtils/integration/auth/readSetCookie.ts";
import { selectAuthRows } from "../../../../testUtils/integration/auth/selectAuthRows.ts";
import { watchSentMails } from "../../../../testUtils/integration/auth/watchSentMails.ts";
import { buildUniqueIp } from "../../../../testUtils/integration/buildUniqueIp.ts";
import { buildUniqueWord } from "../../../../testUtils/integration/buildUniqueWord.ts";
import { expectConflict } from "../../../../testUtils/integration/expectConflict.ts";
import { expectValidationError } from "../../../../testUtils/integration/expectValidationError.ts";
import { flowCookie } from "../../cookie/flowCookie.ts";

const START_REGISTRATION_URL = `${ApiPrefixEnum.AUTH}/registrations`;

function buildBody(
	overrides: Partial<StartRegistrationBodyDto> = {},
): StartRegistrationBodyDto {
	const username = buildUniqueWord();
	return {
		email: `${username.toLowerCase()}@example.com`,
		username,
		password: "un mot de passe assez long",
		remember: false,
		website: "",
		...overrides,
	};
}

async function startRegistration(
	body: StartRegistrationBodyDto,
	{
		ip = buildUniqueIp(),
		cookie,
	}: { ip?: string; cookie?: string | undefined } = {},
) {
	const pending = request(app)
		.post(START_REGISTRATION_URL)
		.set("X-Real-IP", ip)
		.send(body);
	return cookie === undefined ? pending : pending.set("Cookie", cookie);
}

const PENDING_REGISTRATION: FlowStatusDto = {
	flow: {
		kind: FlowKindEnum.REGISTRATION,
		step: FlowStepEnum.MAIL_CODE,
		expiresIn: 1800,
		resendRetryAfter: 60,
		remainingAttempts: 5,
		secondFactorMethods: [],
	},
};

describe("startRegistration", () => {
	describe("200 OK", () => {
		it("SHOULD keep the account in the flow, without any account row, and mail a link and a code WHEN the address is new", async () => {
			// Arrange
			const body = buildBody({ remember: true });
			const mails = watchSentMails();

			// Act
			const response = await startRegistration(body);

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
			expect(response.headers["cache-control"]).toBe("no-store");
			expect(response.body as FlowStatusDto).toStrictEqual(
				PENDING_REGISTRATION,
			);
			expect(await selectAuthRows.userIdsByEmail(body.email)).toStrictEqual([]);
			const [flowId] = await selectAuthRows.flowIdsByEmail(body.email);
			expect(await selectAuthRows.flow(flowId ?? 0)).toMatchObject({
				kind: "registration",
				userId: null,
				payload: { username: body.username },
				remember: 1,
				sendCount: 1,
			});
			const mail = await mails.waitForOne();
			expect(mail).toMatchObject({
				kind: MailKindEnum.AUTH_REGISTRATION,
				to: { email: body.email },
			});
			expect(mail.text).toMatch(/Ton code : \d{6}/u);
			expect(mail.text).toContain("/auth/verify#");
		});

		it("SHOULD never keep the password itself WHEN the flow is created", async () => {
			// Arrange
			const body = buildBody();

			// Act
			await startRegistration(body);

			// Assert
			const [flowId] = await selectAuthRows.flowIdsByEmail(body.email);
			const flow = await selectAuthRows.flow(flowId ?? 0);
			expect(JSON.stringify(flow?.payload)).not.toContain(body.password);
			expect(flow?.payload).toMatchObject({
				passwordHash: expect.stringMatching(/^argon2id:/u) as string,
			});
		});

		it("SHOULD set the flow cookie for the whole registration WHEN it starts", async () => {
			// Arrange : l'horloge figée, la durée du cookie se lit à la seconde près
			useFakeClock(new Date());

			// Act
			const response = await startRegistration(buildBody());

			// Assert
			const setCookie = readSetCookie(response, flowCookie.name);
			expect(setCookie).toContain("Max-Age=1800;");
			expect(setCookie).toContain("HttpOnly");
			expect(setCookie).toContain("SameSite=Lax");
			expect(flowCookie.name).toBe("__Host-citadel_flow");
		});

		it("SHOULD answer exactly the same and mail a warning without code WHEN the address already has an account, whatever its case", async () => {
			// Arrange : l'horloge figée, la durée du cookie se lit à la seconde près. Un midi, loin d'un changement d'heure :
			// les jours se comptent au calendrier de Paris
			useFakeClock(new Date("2026-12-15T11:00:00.000Z"));
			const word = buildUniqueWord().toLowerCase();
			const userId = await insertAuthRows.user({
				email: `${word}@example.com`,
				lastLoginAt: new Date(Date.now() - 3 * 7 * 24 * 60 * 60 * 1000),
			});
			const body = buildBody({ email: `${word.toUpperCase()}@Example.com` });
			const mails = watchSentMails();

			// Act
			const response = await startRegistration(body);

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
			expect(response.body as FlowStatusDto).toStrictEqual(
				PENDING_REGISTRATION,
			);
			expect(readSetCookie(response, flowCookie.name)).toContain(
				"Max-Age=1800;",
			);
			expect(await selectAuthRows.userIdsByEmail(body.email)).toStrictEqual([
				userId,
			]);
			const mail = await mails.waitForOne();
			expect(mail).toMatchObject({
				kind: MailKindEnum.AUTH_REGISTRATION_EXISTING_ACCOUNT,
				to: { email: body.email },
			});
			expect(mail.text).toContain("Ta dernière connexion : il y a 3 semaines.");
			expect(mail.text).not.toMatch(/\d{6}/u);
		});

		it("SHOULD accept two usernames WHEN they differ only by their case", async () => {
			// Arrange
			const word = buildUniqueWord();
			await insertAuthRows.user({ username: word.toLowerCase() });

			// Act
			const response = await startRegistration(
				buildBody({ username: word.toUpperCase() }),
			);

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
		});

		it("SHOULD replace the registration waiting at the same address WHEN another browser starts one", async () => {
			// Arrange
			const body = buildBody();
			await startRegistration(body);
			const [firstFlowId] = await selectAuthRows.flowIdsByEmail(body.email);

			// Act
			await startRegistration({ ...body, username: buildUniqueWord() });

			// Assert
			const flowIds = await selectAuthRows.flowIdsByEmail(body.email);
			expect(flowIds).toHaveLength(1);
			expect(flowIds).not.toContain(firstFlowId);
		});

		it("SHOULD replace the flow of the browser WHEN it starts a new one", async () => {
			// Arrange
			const first = buildBody();
			const firstResponse = await startRegistration(first);

			// Act
			await startRegistration(buildBody(), {
				cookie: readCookieHeader(firstResponse, flowCookie.name),
			});

			// Assert
			expect(await selectAuthRows.flowIdsByEmail(first.email)).toStrictEqual(
				[],
			);
		});

		it("SHOULD answer like a registration, with a decoy flow but no account waiting nor mail, WHEN a robot filled the honeypot", async () => {
			// Arrange
			const body = buildBody({ website: "https://spam.example" });
			const mails = watchSentMails();

			// Act
			const response = await startRegistration(body);

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
			expect(response.body as FlowStatusDto).toStrictEqual(
				PENDING_REGISTRATION,
			);
			const [flowId] = await selectAuthRows.flowIdsByEmail(body.email);
			expect(await selectAuthRows.flow(flowId ?? 0)).toMatchObject({
				payload: null,
				codeHmac: null,
				linkTokenHash: null,
			});
			await mails.expectNone();
		});

		it("SHOULD keep showing the registration WHEN the robot comes back after the honeypot", async () => {
			// Arrange
			const started = await startRegistration(
				buildBody({ website: "https://spam.example" }),
			);

			// Act
			const response = await request(app)
				.get(`${ApiPrefixEnum.AUTH}/flow`)
				.set("Cookie", readCookieHeader(started, flowCookie.name) ?? "");

			// Assert
			expect(response.body as FlowStatusDto).toMatchObject({
				flow: { kind: FlowKindEnum.REGISTRATION, step: FlowStepEnum.MAIL_CODE },
			});
		});

		it("SHOULD leave the registration waiting at the same address WHEN a robot filled the honeypot", async () => {
			// Arrange
			const email = `${buildUniqueWord().toLowerCase()}@example.com`;
			await startRegistration(buildBody({ email }));

			// Act
			await startRegistration(
				buildBody({ email, website: "https://spam.example" }),
			);

			// Assert
			const flowIds = await selectAuthRows.flowIdsByEmail(email);
			const flows = await Promise.all(
				flowIds.map(async (flowId) => selectAuthRows.flow(flowId)),
			);
			expect(flows.map((flow) => flow?.payload ?? null)).toContainEqual(
				expect.objectContaining({ passwordHash: expect.any(String) as string }),
			);
		});
	});

	describe("400 Bad Request", () => {
		it.each([
			{
				reason: "a username with a space",
				overrides: { username: "Alex B" },
				issue: {
					path: ["username"],
					code: ValidationIssueCodeEnum.INVALID_FORMAT,
				},
			},
			{
				reason: "a full-width letter in the email",
				overrides: { email: "ａlex@example.com" },
				issue: {
					path: ["email"],
					code: ValidationIssueCodeEnum.INVALID_CHARACTERS,
				},
			},
			{
				reason: "a zero-width space in the email",
				overrides: { email: "alex​@example.com" },
				issue: {
					path: ["email"],
					code: ValidationIssueCodeEnum.INVALID_CHARACTERS,
				},
			},
			{
				reason: "a password of 11 characters",
				overrides: { password: "a".repeat(11) },
				issue: {
					path: ["password"],
					code: ValidationIssueCodeEnum.TOO_SHORT,
					limit: 12,
				},
			},
		])("SHOULD refuse $reason", async ({ overrides, issue }) => {
			// Act
			const response = await startRegistration(buildBody(overrides));

			// Assert
			expect(response.status).toBe(HttpStatutCodeErrorEnum.BAD_REQUEST);
			expect((response.body as { issues: unknown[] }).issues).toMatchObject([
				issue,
			]);
		});

		it("SHOULD refuse a body WHEN remember-me is missing", async () => {
			// Arrange
			const body: Partial<StartRegistrationBodyDto> = buildBody();
			delete body.remember;

			// Act
			const response = await request(app)
				.post(START_REGISTRATION_URL)
				.send(body);

			// Assert
			expectValidationError(response, [
				{
					path: ["remember"],
					code: ValidationIssueCodeEnum.INVALID_TYPE,
					message: "Remember should be a boolean",
				},
			]);
		});
	});

	describe("403 Forbidden", () => {
		it("SHOULD refuse with REGISTRATION_CLOSED, without flow, WHEN the emergency switch is off", async () => {
			// Arrange
			authSettings.isRegistrationEnabled = false;
			onTestFinished(() => {
				authSettings.isRegistrationEnabled = true;
			});
			const body = buildBody();

			// Act
			const response = await startRegistration(body);

			// Assert
			expect(response.status).toBe(HttpStatutCodeErrorEnum.FORBIDDEN);
			expect(response.body).toStrictEqual({
				code: AuthErrorCodeEnum.REGISTRATION_CLOSED,
				message: "Registrations are closed for today",
			});
			expect(await selectAuthRows.flowIdsByEmail(body.email)).toStrictEqual([]);
		});

		it("SHOULD refuse with REGISTRATION_CLOSED WHEN the daily quota closed registrations", async () => {
			// Arrange
			vi.spyOn(mailService, "getStatus").mockResolvedValue({
				isRegistrationOpen: false,
				isContactOpen: true,
				isSendingOpen: true,
			});

			// Act
			const response = await startRegistration(buildBody());

			// Assert
			expect(response.status).toBe(HttpStatutCodeErrorEnum.FORBIDDEN);
			expect((response.body as { code: string }).code).toBe(
				AuthErrorCodeEnum.REGISTRATION_CLOSED,
			);
		});
	});

	describe("409 Conflict", () => {
		it("SHOULD refuse with USERNAME_TAKEN WHEN an account has this exact username", async () => {
			// Arrange
			const username = buildUniqueWord();
			await insertAuthRows.user({ username });

			// Act
			const response = await startRegistration(buildBody({ username }));

			// Assert
			expectConflict(
				response,
				AuthErrorCodeEnum.USERNAME_TAKEN,
				"The username is already taken",
			);
		});
	});

	describe("429 Too Many Requests", () => {
		it("SHOULD ban the IP for 15 minutes WHEN a 4th registration comes within the hour", async () => {
			// Arrange
			const ip = buildUniqueIp();
			for (let index = 0; index < 3; index++)
				// eslint-disable-next-line no-await-in-loop
				await startRegistration(buildBody(), { ip });

			// Act
			const response = await startRegistration(buildBody(), { ip });

			// Assert
			expect(response.status).toBe(HttpStatutCodeErrorEnum.TOO_MANY_REQUESTS);
			expect(response.headers["retry-after"]).toBe("900");
			expect(response.body).toStrictEqual({
				code: TechnicalErrorCodeEnum.TOO_MANY_REQUESTS,
				message: "Too many registrations from this IP",
			});
		});

		it("SHOULD count the username in the checks of the IP WHEN the registration asks for it", async () => {
			// Arrange
			const ip = buildUniqueIp();
			for (let index = 0; index < 60; index++)
				// eslint-disable-next-line no-await-in-loop
				await request(app)
					.get(
						`${ApiPrefixEnum.AUTH}/usernames/${buildUniqueWord()}/availability`,
					)
					.set("X-Real-IP", ip);

			// Act
			const response = await startRegistration(buildBody(), { ip });

			// Assert
			expect(response.status).toBe(HttpStatutCodeErrorEnum.TOO_MANY_REQUESTS);
			expect(response.body).toMatchObject({
				message: "Too many username checks from this IP",
			});
		});

		it("SHOULD not count the registrations of the IP WHEN the mail limit refused them", async () => {
			// Arrange : l'adresse a déjà reçu ses 5 emails de l'heure, depuis d'autres IP
			const ip = buildUniqueIp();
			const email = `${buildUniqueWord().toLowerCase()}@example.com`;
			for (let index = 0; index < 5; index++)
				// eslint-disable-next-line no-await-in-loop
				await startRegistration(buildBody({ email }));
			for (let index = 0; index < 3; index++)
				// eslint-disable-next-line no-await-in-loop
				await startRegistration(buildBody({ email }), { ip });

			// Act
			const response = await startRegistration(buildBody(), { ip });

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
		});

		it("SHOULD refuse a 6th mail an hour WHEN it goes to the same address", async () => {
			// Arrange : chaque inscription d'une autre IP, pour rester sous la limite des inscriptions
			const email = `${buildUniqueWord().toLowerCase()}@example.com`;
			for (let index = 0; index < 5; index++)
				// eslint-disable-next-line no-await-in-loop
				await startRegistration(buildBody({ email }));

			// Act
			const response = await startRegistration(buildBody({ email }));

			// Assert
			expect(response.status).toBe(HttpStatutCodeErrorEnum.TOO_MANY_REQUESTS);
			expect(Number(response.headers["retry-after"])).toBeGreaterThan(3500);
		});
	});
});
