import { describe, expect, it } from "vitest";

import { MailKindEnum } from "../../../mail/mailKind.enum.ts";
import { buildSecurityNoticeMail } from "./buildSecurityNoticeMail.ts";
import type { SecurityNoticeKind } from "./securityNoticeKind.type.ts";

const KINDS: SecurityNoticeKind[] = [
	MailKindEnum.AUTH_NOTICE_PASSWORD_CHANGED,
	MailKindEnum.AUTH_NOTICE_EMAIL_CHANGED,
	MailKindEnum.AUTH_NOTICE_SECOND_FACTOR_ADDED,
	MailKindEnum.AUTH_NOTICE_SECOND_FACTOR_REMOVED,
	MailKindEnum.AUTH_NOTICE_ACCOUNT_DELETED,
];

describe("buildSecurityNoticeMail.ts", () => {
	describe("mail", () => {
		it.each(KINDS)(
			"SHOULD keep its own kind, have no reply address and never carry a code WHEN the notice is %s",
			(kind) => {
				// Act
				const mail = buildSecurityNoticeMail(kind, "sam@example.com");

				// Assert
				expect(mail).toMatchObject({
					kind,
					to: { email: "sam@example.com", name: null },
				});
				expect(mail.replyTo).toBeNull();
				expect(mail.text).not.toContain("Ton code");
				expect(mail.text).toContain("Si tu n'as pas effectué cette action, ");
				expect(mail.text).toContain("contact@alexandre-richard.fr");
			},
		);

		it("SHOULD point to the password reset WHEN the notice follows a change the owner may not have made", () => {
			const { text } = buildSecurityNoticeMail(
				MailKindEnum.AUTH_NOTICE_PASSWORD_CHANGED,
				"sam@example.com",
			);

			expect(text).toContain(
				"Réinitialiser mon mot de passe : https://alexandre-richard.fr/auth/forgot-password",
			);
		});

		it("SHOULD say the backups forget the data within three months and offer no button WHEN the account is deleted", () => {
			const { text } = buildSecurityNoticeMail(
				MailKindEnum.AUTH_NOTICE_ACCOUNT_DELETED,
				"sam@example.com",
			);

			expect(text).toContain("disparaît au plus tard dans trois mois");
			expect(text).not.toContain("https://alexandre-richard.fr/auth");
		});
	});
});
