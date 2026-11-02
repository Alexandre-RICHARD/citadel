import { ContactAcknowledgementEnum } from "@citadel/specs/src/projects/contact/contactAcknowledgement.enum.ts";
import type { ContactMessageReceiptDto } from "@citadel/specs/src/projects/contact/dto/contactMessageReceiptDto.type.ts";
import type { SendContactMessageBodyDto } from "@citadel/specs/src/projects/contact/endpoint/messages/sendContactMessage/sendContactMessageBodyDto.type.ts";
import { ContactErrorCodeEnum } from "@citadel/specs/src/projects/contact/error/contactErrorCode.enum.ts";
import { MailErrorCodeEnum } from "@citadel/specs/src/projects/mail/error/mailErrorCode.enum.ts";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum.ts";
import { TechnicalErrorCodeEnum } from "@citadel/specs/src/specUtils/error/technicalErrorCode.enum.ts";
import { ValidationIssueCodeEnum } from "@citadel/specs/src/specUtils/error/validationIssueCode.enum.ts";
import { HttpStatutCodeErrorEnum } from "@citadel/specs/src/specUtils/httpStatutCodeError.enum.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";
import { QueryTypes } from "sequelize";
import request from "supertest";
import { describe, expect, it, vi } from "vitest";

import { app } from "../../../../app.ts";
import { env } from "../../../../configuration/env.ts";
import { sequelize } from "../../../../configuration/sequelize.ts";
import { BadGatewayError } from "../../../../error/BadGatewayError.ts";
import { CONTACT_ADDRESS } from "../../../../mail/address/contactAddress.ts";
import type { Mail } from "../../../../mail/mail.type.ts";
import { MailKindEnum } from "../../../../mail/mailKind.enum.ts";
import { mailService } from "../../../../mail/mailService.ts";
import { memoryMailSender } from "../../../../mail/sender/memoryMailSender.ts";
import { buildUniqueWord } from "../../../../testUtils/integration/buildUniqueWord.ts";
import { countTableRows } from "../../../../testUtils/integration/countTableRows.ts";
import { expectValidationError } from "../../../../testUtils/integration/expectValidationError.ts";
import { watchErrorLogs } from "../../../../testUtils/integration/watchErrorLogs.ts";
import { ContactMessageUnsent } from "../../models/ContactMessageUnsent.ts";

const SEND_CONTACT_MESSAGE_URL = `${ApiPrefixEnum.CONTACT}/messages`;
const HOUR_SECONDS = 3600;

let lastIpSuffix = 0;

// Chaque test écrit depuis sa propre IP : la limite par heure ne dépend pas de l'ordre des tests
function buildUniqueIp(): string {
	lastIpSuffix += 1;
	return `2001:db8::${lastIpSuffix.toString(16)}`;
}

function buildBody(
	overrides: Partial<SendContactMessageBodyDto> = {},
): SendContactMessageBodyDto {
	return {
		subject: `Question ${buildUniqueWord()}`,
		message: "Bonjour,\nComment ajouter un jeu au Backlog ?",
		email: `${buildUniqueWord().toLowerCase()}@example.com`,
		name: "Sam",
		website: "",
		...overrides,
	};
}

async function postMessage(
	body: SendContactMessageBodyDto,
	ip = buildUniqueIp(),
) {
	return request(app)
		.post(SEND_CONTACT_MESSAGE_URL)
		.set("X-Real-IP", ip)
		.send(body);
}

// Les mails envoyés par `send` seulement : ceux des tests précédents restent dans l'expéditeur en mémoire
async function collectSentMails(send: () => Promise<unknown>): Promise<Mail[]> {
	const sentBefore = memoryMailSender.sentMails.length;
	await send();
	return memoryMailSender.sentMails.slice(sentBefore);
}

describe("sendContactMessage", () => {
	describe("200 OK", () => {
		it("SHOULD notify contact with the whole message and acknowledge the visitor with the subject only WHEN an email is given", async () => {
			// Arrange
			const body = buildBody();
			let response: request.Response | undefined;

			// Act
			const sentMails = await collectSentMails(async () => {
				response = await postMessage(body);
			});

			// Assert
			expect(response?.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
			expect(response?.body as ContactMessageReceiptDto).toStrictEqual({
				acknowledgement: ContactAcknowledgementEnum.SENT,
			});
			const [notification, acknowledgement] = sentMails;
			expect(sentMails).toHaveLength(2);

			expect(notification).toMatchObject({
				kind: MailKindEnum.CONTACT_NOTIFICATION,
				to: CONTACT_ADDRESS,
				replyTo: { email: body.email, name: body.name },
				subject: `[Contact] ${body.subject}`,
			});
			expect(notification?.text).toContain(body.message);
			expect(notification?.html).toContain(
				"Comment ajouter un jeu au Backlog ?",
			);

			expect(acknowledgement).toMatchObject({
				kind: MailKindEnum.CONTACT_ACKNOWLEDGEMENT,
				to: { email: body.email, name: null },
				replyTo: CONTACT_ADDRESS,
				subject: `Message bien reçu : ${body.subject}`,
			});
			expect(acknowledgement?.text).not.toContain(body.message);
			expect(acknowledgement?.text).not.toContain("Sam");
			expect(acknowledgement?.text).toContain(
				"vous ne recevrez pas d'autre accusé de réception",
			);
		});

		it("SHOULD only notify contact, without reply address, WHEN no email is given", async () => {
			// Arrange
			let response: request.Response | undefined;

			// Act
			const sentMails = await collectSentMails(async () => {
				response = await postMessage(buildBody({ email: null, name: null }));
			});

			// Assert
			expect(response?.body as ContactMessageReceiptDto).toStrictEqual({
				acknowledgement: ContactAcknowledgementEnum.NO_EMAIL,
			});
			expect(sentMails).toHaveLength(1);
			expect(sentMails[0]).toMatchObject({
				kind: MailKindEnum.CONTACT_NOTIFICATION,
				replyTo: null,
			});
		});

		it("SHOULD not acknowledge again WHEN the same address writes twice the same day", async () => {
			// Arrange
			const email = `${buildUniqueWord().toLowerCase()}@example.com`;
			await postMessage(buildBody({ email }));
			let response: request.Response | undefined;

			// Act
			const sentMails = await collectSentMails(async () => {
				response = await postMessage(buildBody({ email: email.toUpperCase() }));
			});

			// Assert
			expect(response?.body as ContactMessageReceiptDto).toStrictEqual({
				acknowledgement: ContactAcknowledgementEnum.ALREADY_SENT_TODAY,
			});
			expect(sentMails.map((mail) => mail.kind)).toStrictEqual([
				MailKindEnum.CONTACT_NOTIFICATION,
			]);
		});

		it("SHOULD answer as a success and send nothing WHEN the honeypot is filled", async () => {
			// Arrange
			let response: request.Response | undefined;

			// Act
			const sentMails = await collectSentMails(async () => {
				response = await postMessage(
					buildBody({ website: "https://spam.example" }),
				);
			});

			// Assert
			expect(response?.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
			expect(sentMails).toStrictEqual([]);
		});

		it("SHOULD still succeed, say the acknowledgement failed, and record and log the failure WHEN only the acknowledgement fails", async () => {
			// Arrange
			const { expectLogged } = await watchErrorLogs();
			const failuresBefore = await countTableRows("mail_failure");
			vi.spyOn(memoryMailSender, "send")
				.mockResolvedValueOnce()
				.mockRejectedValueOnce(
					new BadGatewayError(
						MailErrorCodeEnum.MAIL_UNAVAILABLE,
						"Brevo refused the contact-acknowledgement mail (400, no code)",
					),
				);

			// Act
			const response = await postMessage(buildBody());

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
			expect(response.body as ContactMessageReceiptDto).toStrictEqual({
				acknowledgement: ContactAcknowledgementEnum.FAILED,
			});
			expect(await countTableRows("mail_failure")).toBe(failuresBefore + 1);
			await expectLogged({
				errorType: "BadGatewayError",
				message:
					"[Accusé de réception du formulaire de contact] Brevo refused the contact-acknowledgement mail (400, no code)",
			});
		});
		it("SHOULD keep the whole message in the database, without the IP, and still succeed WHEN the notification cannot be sent", async () => {
			// Arrange
			const body = buildBody({
				name: "Alex",
				message: "Un message à ne pas perdre.\nAvec deux lignes.",
			});
			const unsentBefore = await countTableRows("contact_message_unsent");
			vi.spyOn(memoryMailSender, "send").mockRejectedValueOnce(
				new BadGatewayError(
					MailErrorCodeEnum.MAIL_UNAVAILABLE,
					"Brevo did not answer on /smtp/email",
				),
			);

			// Act
			const response = await postMessage(body);

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
			expect(await countTableRows("contact_message_unsent")).toBe(
				unsentBefore + 1,
			);
			const [keptMessage] = await sequelize.query(
				"SELECT subject, message, name, email FROM contact_message_unsent WHERE subject = :subject",
				{ type: QueryTypes.SELECT, replacements: { subject: body.subject } },
			);
			expect(keptMessage).toStrictEqual({
				subject: body.subject,
				message: body.message,
				name: body.name,
				email: body.email,
			});
		});
	});

	describe("400 Bad Request", () => {
		it("SHOULD refuse the message without sending anything WHEN the subject is empty and the email invalid", async () => {
			// Act
			const sentMails = await collectSentMails(async () => {
				const response = await postMessage(
					buildBody({ subject: " ", email: "sam@" }),
				);

				// Assert
				expectValidationError(response, [
					{
						path: ["subject"],
						code: ValidationIssueCodeEnum.TOO_SHORT,
						limit: 1,
						message: "Subject should contain at least 1 character",
					},
					{
						path: ["email"],
						code: ValidationIssueCodeEnum.INVALID_FORMAT,
						message: "Email should be a valid address",
					},
				]);
			});

			expect(sentMails).toStrictEqual([]);
		});
	});

	describe("403 Forbidden", () => {
		it("SHOULD refuse the message without sending anything WHEN the daily quota closed the form", async () => {
			// Arrange
			vi.spyOn(mailService, "getStatus").mockResolvedValueOnce({
				isRegistrationOpen: false,
				isContactOpen: false,
				isSendingOpen: true,
			});
			let response: request.Response | undefined;

			// Act
			const sentMails = await collectSentMails(async () => {
				response = await postMessage(buildBody());
			});

			// Assert
			expect(response?.status).toBe(HttpStatutCodeErrorEnum.FORBIDDEN);
			expect(response?.body).toStrictEqual({
				code: ContactErrorCodeEnum.CONTACT_CLOSED,
				message: "The daily mail quota closed the contact form",
			});
			expect(sentMails).toStrictEqual([]);
		});
	});

	describe("429 Too Many Requests", () => {
		it("SHOULD refuse with a Retry-After of about an hour WHEN the same IP exceeds the hourly limit", async () => {
			// Arrange
			const ip = buildUniqueIp();
			for (let index = 0; index < env.CONTACT_HOURLY_LIMIT_PER_IP; index += 1)
				// eslint-disable-next-line no-await-in-loop
				await postMessage(buildBody({ email: null }), ip);

			// Act
			const response = await postMessage(buildBody(), ip);

			// Assert
			expect(response.status).toBe(HttpStatutCodeErrorEnum.TOO_MANY_REQUESTS);
			expect(response.body).toStrictEqual({
				code: TechnicalErrorCodeEnum.TOO_MANY_REQUESTS,
				message: "Too many contact messages from this IP",
			});
			const retryAfter = Number(response.headers["retry-after"]);
			expect(retryAfter).toBeGreaterThan(HOUR_SECONDS - 60);
			expect(retryAfter).toBeLessThanOrEqual(HOUR_SECONDS);
		});

		it("SHOULD accept another IP WHEN one IP reached the limit", async () => {
			// Arrange
			const ip = buildUniqueIp();
			for (let index = 0; index < env.CONTACT_HOURLY_LIMIT_PER_IP; index += 1)
				// eslint-disable-next-line no-await-in-loop
				await postMessage(buildBody({ email: null }), ip);

			// Act
			const response = await postMessage(buildBody());

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
		});
	});

	describe("502 Bad Gateway", () => {
		it("SHOULD answer MAIL_UNAVAILABLE and keep nothing WHEN the notification cannot be sent and the database cannot keep the message", async () => {
			// Arrange
			vi.spyOn(console, "error").mockImplementation(() => undefined);
			const unsentBefore = await countTableRows("contact_message_unsent");
			vi.spyOn(memoryMailSender, "send").mockRejectedValueOnce(
				new BadGatewayError(
					MailErrorCodeEnum.MAIL_UNAVAILABLE,
					"Brevo did not answer on /smtp/email",
				),
			);
			vi.spyOn(ContactMessageUnsent, "create").mockRejectedValueOnce(
				new Error("database down"),
			);

			// Act
			const response = await postMessage(buildBody());

			// Assert
			expect(response.status).toBe(HttpStatutCodeErrorEnum.BAD_GATEWAY);
			expect(response.body).toStrictEqual({
				code: MailErrorCodeEnum.MAIL_UNAVAILABLE,
				message: "Brevo did not answer on /smtp/email",
			});
			expect(await countTableRows("contact_message_unsent")).toBe(unsentBefore);
		});
	});
});
