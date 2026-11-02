import type { MailFailureSummaryDto } from "@citadel/specs/src/projects/mail/dto/mailFailureSummaryDto.type.ts";
import { MailErrorCodeEnum } from "@citadel/specs/src/projects/mail/error/mailErrorCode.enum.ts";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum.ts";
import { TechnicalErrorCodeEnum } from "@citadel/specs/src/specUtils/error/technicalErrorCode.enum.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";
import request from "supertest";
import { describe, expect, it, vi } from "vitest";

import { app } from "../../../../app.ts";
import { sequelize } from "../../../../configuration/sequelize.ts";
import { BadGatewayError } from "../../../../error/BadGatewayError.ts";
import { NOREPLY_ADDRESS } from "../../../../mail/address/noreplyAddress.ts";
import type { Mail } from "../../../../mail/mail.type.ts";
import { MailKindEnum } from "../../../../mail/mailKind.enum.ts";
import { mailService } from "../../../../mail/mailService.ts";
import { memoryMailSender } from "../../../../mail/sender/memoryMailSender.ts";
import { expectDateBetween } from "../../../../testUtils/integration/expectDateBetween.ts";
import { expectNotFound } from "../../../../testUtils/integration/expectNotFound.ts";

const GET_MAIL_FAILURE_SUMMARY_URL = `${ApiPrefixEnum.INTERNAL}${ApiPrefixEnum.MAIL}/failures`;
const WINDOW_DAYS = 7;

const QUOTA_ALERT_MAIL: Mail = {
	kind: MailKindEnum.QUOTA_ALERT,
	to: NOREPLY_ADDRESS,
	replyTo: null,
	subject: "Alerte",
	text: "Alerte",
	html: "<p>Alerte</p>",
};

async function getSummary(): Promise<MailFailureSummaryDto> {
	const response = await request(app).get(GET_MAIL_FAILURE_SUMMARY_URL);
	expect(response.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
	return response.body as MailFailureSummaryDto;
}

// Un envoi que le fournisseur refuse : MailService l'enregistre, puis renvoie l'erreur
async function failOneSend(): Promise<void> {
	vi.spyOn(memoryMailSender, "send").mockRejectedValueOnce(
		new BadGatewayError(
			MailErrorCodeEnum.MAIL_UNAVAILABLE,
			"Brevo did not answer on /smtp/email",
		),
	);
	await expect(mailService.send(QUOTA_ALERT_MAIL)).rejects.toThrow(
		BadGatewayError,
	);
}

describe("getMailFailureSummary", () => {
	describe("200 OK", () => {
		it("SHOULD count each failed send and date the last one WHEN mails could not be sent", async () => {
			// Arrange
			const { count: countBefore } = await getSummary();
			const start = new Date();
			await failOneSend();
			await failOneSend();
			const end = new Date();

			// Act
			const summary = await getSummary();

			// Assert
			expect(summary.windowDays).toBe(WINDOW_DAYS);
			expect(summary.count).toBe(countBefore + 2);
			expectDateBetween(new Date(summary.lastFailedAt ?? ""), start, end);
		});

		it("SHOULD not count a failure WHEN it is older than the window", async () => {
			// Arrange
			const { count: countBefore } = await getSummary();
			await sequelize.query(
				`INSERT INTO mail_failure (kind, reason, created_at)
				VALUES ('quota-alert', 'Old failure', NOW(3) - INTERVAL ${WINDOW_DAYS + 1} DAY)`,
			);

			// Act
			const summary = await getSummary();

			// Assert
			expect(summary.count).toBe(countBefore);
		});
	});

	describe("404 Not Found", () => {
		it("SHOULD answer like an unknown route WHEN the request came through Caddy", async () => {
			// Act
			const response = await request(app)
				.get(GET_MAIL_FAILURE_SUMMARY_URL)
				.set("X-Real-IP", "203.0.113.7");

			// Assert
			expectNotFound(
				response,
				TechnicalErrorCodeEnum.ROUTE_NOT_FOUND,
				`Route not handled by the server: GET ${GET_MAIL_FAILURE_SUMMARY_URL}`,
			);
		});
	});
});
