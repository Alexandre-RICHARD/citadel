import { describe, expect, it } from "vitest";

import { CONTACT_ADDRESS } from "../../../mail/address/contactAddress.ts";
import { MailKindEnum } from "../../../mail/mailKind.enum.ts";
import { buildContactAcknowledgementMail } from "./buildContactAcknowledgementMail.ts";

describe("buildContactAcknowledgementMail.ts", () => {
	describe("mail", () => {
		it("SHOULD only quote the subject and say nothing of a delay WHEN the mail is sent right away", () => {
			// Act
			const mail = buildContactAcknowledgementMail(
				"sam@example.com",
				"Question",
			);

			// Assert
			expect(mail).toMatchObject({
				kind: MailKindEnum.CONTACT_ACKNOWLEDGEMENT,
				to: { email: "sam@example.com", name: null },
				replyTo: CONTACT_ADDRESS,
				subject: "Message bien reçu : Question",
			});
			expect(mail.text).not.toContain("avec du retard");
		});

		it("SHOULD say it arrives late and that the message was not lost WHEN the mail is a delayed one", () => {
			// Act
			const mail = buildContactAcknowledgementMail(
				"sam@example.com",
				"Question",
				{ isDelayed: true },
			);

			// Assert
			expect(mail.subject).toBe("Message bien reçu : Question");
			expect(mail.text).toContain("avec du retard");
			expect(mail.text).toContain("n'a pas été perdu");
			expect(mail.html).toContain("avec du retard");
		});
	});
});
