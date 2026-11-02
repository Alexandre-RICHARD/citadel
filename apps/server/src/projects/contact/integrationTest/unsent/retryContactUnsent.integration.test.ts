import { ContactRetryStopEnum } from "@citadel/specs/src/projects/contact/contactRetryStop.enum.ts";
import type { ContactUnsentRetryDto } from "@citadel/specs/src/projects/contact/dto/contactUnsentRetryDto.type.ts";
import { MailErrorCodeEnum } from "@citadel/specs/src/projects/mail/error/mailErrorCode.enum.ts";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum.ts";
import { TechnicalErrorCodeEnum } from "@citadel/specs/src/specUtils/error/technicalErrorCode.enum.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { app } from "../../../../app.ts";
import { BadGatewayError } from "../../../../error/BadGatewayError.ts";
import type { Mail } from "../../../../mail/mail.type.ts";
import { MailKindEnum } from "../../../../mail/mailKind.enum.ts";
import { mailService } from "../../../../mail/mailService.ts";
import { memoryMailSender } from "../../../../mail/sender/memoryMailSender.ts";
import { buildUniqueWord } from "../../../../testUtils/integration/buildUniqueWord.ts";
import { countTableRows } from "../../../../testUtils/integration/countTableRows.ts";
import { expectNotFound } from "../../../../testUtils/integration/expectNotFound.ts";
import { ContactMessageUnsent } from "../../models/ContactMessageUnsent.ts";

const RETRY_CONTACT_UNSENT_URL = `${ApiPrefixEnum.INTERNAL}${ApiPrefixEnum.CONTACT}/unsent/retry`;

type UnsentSeed = {
	subject: string;
	email: string | null;
	name: string | null;
};

// La relance traite toute la table : chaque test repart d'une table vide
beforeEach(async () => {
	await ContactMessageUnsent.destroy({ where: {} });
});

async function seedUnsent(
	overrides: Partial<UnsentSeed> = {},
): Promise<UnsentSeed> {
	const seed = {
		subject: `Question ${buildUniqueWord()}`,
		email: `${buildUniqueWord().toLowerCase()}@example.com`,
		name: "Sam",
		...overrides,
	};
	await ContactMessageUnsent.create({
		...seed,
		message: `Message de ${seed.subject}`,
		createdAt: new Date("2026-11-01T18:30:00.000Z"),
	});
	return seed;
}

// Les mails envoyés par la relance seulement : ceux des tests précédents restent dans l'expéditeur en mémoire
async function retry(): Promise<{
	body: ContactUnsentRetryDto;
	sentMails: Mail[];
}> {
	const sentBefore = memoryMailSender.sentMails.length;
	const response = await request(app).post(RETRY_CONTACT_UNSENT_URL);
	expect(response.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
	return {
		body: response.body as ContactUnsentRetryDto,
		sentMails: memoryMailSender.sentMails.slice(sentBefore),
	};
}

function refuseOnce(): BadGatewayError {
	return new BadGatewayError(
		MailErrorCodeEnum.MAIL_UNAVAILABLE,
		"Brevo did not answer on /smtp/email",
	);
}

describe("retryContactUnsent", () => {
	describe("200 OK", () => {
		it("SHOULD resend the notification and the delayed acknowledgement, then delete the row WHEN a message waits", async () => {
			// Arrange
			const seed = await seedUnsent();

			// Act
			const { body, sentMails } = await retry();

			// Assert
			expect(body).toStrictEqual({
				sentCount: 1,
				remainingCount: 0,
				stoppedBecause: null,
			});
			expect(sentMails.map((mail) => mail.kind)).toStrictEqual([
				MailKindEnum.CONTACT_NOTIFICATION,
				MailKindEnum.CONTACT_ACKNOWLEDGEMENT,
			]);
			const [notification, acknowledgement] = sentMails;
			expect(notification?.subject).toBe(`[Contact] ${seed.subject} (différé)`);
			expect(notification?.text).toContain(`Message de ${seed.subject}`);
			expect(notification?.text).toContain("Date : dimanche 1 novembre 2026");
			expect(acknowledgement?.to.email).toBe(seed.email);
			expect(acknowledgement?.text).toContain("avec du retard");
			expect(await countTableRows("mailing_contact_message_unsent")).toBe(0);
		});

		it("SHOULD acknowledge an address once and send no acknowledgement without address WHEN several messages wait", async () => {
			// Arrange
			const email = `${buildUniqueWord().toLowerCase()}@example.com`;
			await seedUnsent({ email });
			await seedUnsent({ email: email.toUpperCase() });
			await seedUnsent({ email: null, name: null });

			// Act
			const { body, sentMails } = await retry();

			// Assert
			expect(body.sentCount).toBe(3);
			expect(
				sentMails.filter(
					(mail) => mail.kind === MailKindEnum.CONTACT_NOTIFICATION,
				),
			).toHaveLength(3);
			expect(
				sentMails.filter(
					(mail) => mail.kind === MailKindEnum.CONTACT_ACKNOWLEDGEMENT,
				),
			).toHaveLength(1);
		});

		it("SHOULD report nothing sent WHEN no message waits", async () => {
			// Act
			const { body, sentMails } = await retry();

			// Assert
			expect(body).toStrictEqual({
				sentCount: 0,
				remainingCount: 0,
				stoppedBecause: null,
			});
			expect(sentMails).toStrictEqual([]);
		});

		it("SHOULD keep the rows and stop WHEN the quota closed the contact", async () => {
			// Arrange
			await seedUnsent();
			await seedUnsent();
			vi.spyOn(mailService, "getStatus").mockResolvedValue({
				isRegistrationOpen: false,
				isContactOpen: false,
				isSendingOpen: true,
			});

			// Act
			const { body, sentMails } = await retry();

			// Assert
			expect(body).toStrictEqual({
				sentCount: 0,
				remainingCount: 2,
				stoppedBecause: ContactRetryStopEnum.QUOTA_REACHED,
			});
			expect(sentMails).toStrictEqual([]);
			expect(await countTableRows("mailing_contact_message_unsent")).toBe(2);
		});

		it("SHOULD keep the rows, stop, and record no mail failure WHEN the provider refuses the notification", async () => {
			// Arrange
			vi.spyOn(console, "error").mockImplementation(() => undefined);
			await seedUnsent();
			await seedUnsent();
			const failuresBefore = await countTableRows("mailing_failure");
			vi.spyOn(memoryMailSender, "send").mockRejectedValueOnce(refuseOnce());

			// Act
			const { body } = await retry();

			// Assert
			expect(body).toStrictEqual({
				sentCount: 0,
				remainingCount: 2,
				stoppedBecause: ContactRetryStopEnum.SEND_FAILED,
			});
			expect(await countTableRows("mailing_contact_message_unsent")).toBe(2);
			expect(await countTableRows("mailing_failure")).toBe(failuresBefore);
		});

		it("SHOULD still delete the row WHEN only the acknowledgement is refused", async () => {
			// Arrange
			vi.spyOn(console, "error").mockImplementation(() => undefined);
			await seedUnsent();
			vi.spyOn(memoryMailSender, "send")
				.mockResolvedValueOnce()
				.mockRejectedValueOnce(refuseOnce());

			// Act
			const { body } = await retry();

			// Assert
			expect(body).toStrictEqual({
				sentCount: 1,
				remainingCount: 0,
				stoppedBecause: null,
			});
			expect(await countTableRows("mailing_contact_message_unsent")).toBe(0);
		});
	});

	describe("404 Not Found", () => {
		it("SHOULD answer like an unknown route and send nothing WHEN the request came through Caddy", async () => {
			// Arrange
			await seedUnsent();

			// Act
			const response = await request(app)
				.post(RETRY_CONTACT_UNSENT_URL)
				.set("X-Real-IP", "203.0.113.7");

			// Assert
			expectNotFound(
				response,
				TechnicalErrorCodeEnum.ROUTE_NOT_FOUND,
				`Route not handled by the server: POST ${RETRY_CONTACT_UNSENT_URL}`,
			);
			expect(await countTableRows("mailing_contact_message_unsent")).toBe(1);
		});
	});
});
