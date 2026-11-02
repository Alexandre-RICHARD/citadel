import { describe, expect, it } from "vitest";

import { CONTACT_ADDRESS } from "../address/contactAddress.ts";
import { MailKindEnum } from "../mailKind.enum.ts";
import { MailThresholdEnum } from "../quota/mailThreshold.enum.ts";
import { buildQuotaAlertMail } from "./buildQuotaAlertMail.ts";

const LIMITS = { registrationStop: 250, contactStop: 280, dailyLimit: 300 };

describe("buildQuotaAlertMail.ts", () => {
	describe("mail", () => {
		it("SHOULD go to contact and name the closed feature in the subject WHEN a threshold is crossed", () => {
			const mail = buildQuotaAlertMail(
				MailThresholdEnum.REGISTRATION,
				250,
				LIMITS,
			);

			expect(mail).toMatchObject({
				kind: MailKindEnum.QUOTA_ALERT,
				to: CONTACT_ADDRESS,
				replyTo: null,
				subject:
					"[Citadel] Quota d'emails : inscriptions fermées pour aujourd'hui",
			});
		});

		it("SHOULD give the count, the gauge and what stays open WHEN a threshold is crossed", () => {
			const { text } = buildQuotaAlertMail(
				MailThresholdEnum.CONTACT,
				280,
				LIMITS,
			);

			expect(text).toContain("280 / 300 emails aujourd'hui (93 %)");
			expect(text).toContain(
				"- Formulaire de contact (Ferme à 280 envois) : Fermé",
			);
			expect(text).toContain(
				"- Tous les envois, connexion comprise (Plafond de Brevo : 300 envois) : Actifs",
			);
		});
	});
});
