import { describe, expect, it, vi } from "vitest";

import { env } from "../configuration/env.ts";
import { CONTACT_ADDRESS } from "./address/contactAddress.ts";
import { NOREPLY_ADDRESS } from "./address/noreplyAddress.ts";
import type { Mail } from "./mail.type.ts";
import { MailKindEnum } from "./mailKind.enum.ts";
import { mailService } from "./mailService.ts";
import { memoryMailSender } from "./sender/memoryMailSender.ts";

const VISITOR_MAIL: Mail = {
	kind: MailKindEnum.CONTACT_ACKNOWLEDGEMENT,
	to: NOREPLY_ADDRESS,
	replyTo: null,
	subject: "Accusé",
	text: "Accusé",
	html: "<p>Accusé</p>",
};

function sentQuotaAlerts(): Mail[] {
	return memoryMailSender.sentMails.filter(
		(mail) => mail.kind === MailKindEnum.QUOTA_ALERT,
	);
}

// Envoie des emails de visiteurs jusqu'à ce que `total` emails soient partis aujourd'hui, alertes comprises
async function sendUntilTodayCount(total: number): Promise<void> {
	while (memoryMailSender.sentMails.length < total)
		// eslint-disable-next-line no-await-in-loop -- chaque envoi doit être compté avant le suivant
		await mailService.send(VISITOR_MAIL);
}

describe("mailService", () => {
	describe("quota alert", () => {
		it("SHOULD send one alert to contact per threshold, the last one being the last mail of the day, WHEN the daily quota fills up", async () => {
			// Arrange
			memoryMailSender.sentMails.length = 0;

			// Act : un email de moins que chaque seuil, puis l'email qui le franchit
			await sendUntilTodayCount(env.MAIL_REGISTRATION_STOP - 1);
			const alertsBeforeRegistrationStop = sentQuotaAlerts().length;
			await sendUntilTodayCount(env.MAIL_REGISTRATION_STOP);
			await vi.waitFor(() => {
				expect(sentQuotaAlerts()).toHaveLength(1);
			});

			await sendUntilTodayCount(env.MAIL_CONTACT_STOP);
			await vi.waitFor(() => {
				expect(sentQuotaAlerts()).toHaveLength(2);
			});

			await sendUntilTodayCount(env.MAIL_DAILY_LIMIT - 1);
			await vi.waitFor(() => {
				expect(sentQuotaAlerts()).toHaveLength(3);
			});
			const status = await mailService.getStatus();

			// Assert
			expect(alertsBeforeRegistrationStop).toBe(0);
			const alerts = sentQuotaAlerts();
			for (const alert of alerts)
				expect(alert.to).toStrictEqual(CONTACT_ADDRESS);
			expect(alerts.map((alert) => alert.subject)).toStrictEqual([
				"[Citadel] Quota d'emails : inscriptions fermées pour aujourd'hui",
				"[Citadel] Quota d'emails : formulaire de contact fermé pour aujourd'hui",
				"[Citadel] Quota d'emails : plus aucun envoi pour aujourd'hui",
			]);
			expect(memoryMailSender.sentMails).toHaveLength(env.MAIL_DAILY_LIMIT);
			expect(memoryMailSender.sentMails.at(-1)?.kind).toBe(
				MailKindEnum.QUOTA_ALERT,
			);
			expect(status).toStrictEqual({
				isRegistrationOpen: false,
				isContactOpen: false,
				isSendingOpen: false,
			});
		});
	});
});
