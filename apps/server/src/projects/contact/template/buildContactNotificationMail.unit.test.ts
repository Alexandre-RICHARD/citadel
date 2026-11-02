import { describe, expect, it } from "vitest";

import { CONTACT_ADDRESS } from "../../../mail/address/contactAddress.ts";
import { MailKindEnum } from "../../../mail/mailKind.enum.ts";
import { buildContactNotificationMail } from "./buildContactNotificationMail.ts";

const MESSAGE = {
	subject: "Question",
	message: "Bonjour",
	email: "sam@example.com",
	name: "Sam",
};
const WRITTEN_AT = new Date("2026-11-01T18:30:00.000Z");

describe("buildContactNotificationMail.ts", () => {
	describe("mail", () => {
		it("SHOULD go to contact with the visitor as reply address and the date they wrote WHEN the mail is sent right away", () => {
			// Act
			const mail = buildContactNotificationMail(MESSAGE, WRITTEN_AT);

			// Assert
			expect(mail).toMatchObject({
				kind: MailKindEnum.CONTACT_NOTIFICATION,
				to: CONTACT_ADDRESS,
				replyTo: { email: "sam@example.com", name: "Sam" },
				subject: "[Contact] Question",
			});
			expect(mail.text).toContain("Date : dimanche 1 novembre 2026 à 19:30");
		});

		it("SHOULD only add a suffix to the subject, with the same content and the original date, WHEN the mail is a delayed one", () => {
			// Arrange
			const immediate = buildContactNotificationMail(MESSAGE, WRITTEN_AT);

			// Act
			const delayed = buildContactNotificationMail(MESSAGE, WRITTEN_AT, {
				isDelayed: true,
			});

			// Assert
			expect(delayed.subject).toBe("[Contact] Question (différé)");
			expect({ ...delayed, subject: immediate.subject }).toStrictEqual(
				immediate,
			);
		});
	});
});
