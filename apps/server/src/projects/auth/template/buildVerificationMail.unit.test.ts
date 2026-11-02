import { describe, expect, it } from "vitest";

import { MailKindEnum } from "../../../mail/mailKind.enum.ts";
import { MAIL_SITE } from "../../../mail/mailSite.ts";
import { buildEmailChangeMail } from "./buildEmailChangeMail.ts";
import { buildEmailFactorActivationMail } from "./buildEmailFactorActivationMail.ts";
import { buildMailLoginMail } from "./buildMailLoginMail.ts";
import { buildPasswordResetMail } from "./buildPasswordResetMail.ts";
import { buildRegistrationMail } from "./buildRegistrationMail.ts";
import { buildSecondFactorMail } from "./buildSecondFactorMail.ts";

const PARAMETERS = {
	email: "sam@example.com",
	linkUrl: "https://alexandre-richard.fr/auth/verify?token=abc",
	code: "482913",
	validityMinutes: 30,
};

describe("buildVerificationMail.ts", () => {
	describe("mails with a link and a code", () => {
		it.each([
			[buildRegistrationMail, MailKindEnum.AUTH_REGISTRATION],
			[buildPasswordResetMail, MailKindEnum.AUTH_PASSWORD_RESET],
			[buildMailLoginMail, MailKindEnum.AUTH_MAIL_LOGIN],
			[buildSecondFactorMail, MailKindEnum.AUTH_SECOND_FACTOR],
			[
				buildEmailFactorActivationMail,
				MailKindEnum.AUTH_EMAIL_FACTOR_ACTIVATION,
			],
			[buildEmailChangeMail, MailKindEnum.AUTH_EMAIL_CHANGE],
		])(
			"SHOULD go to the recipient, with no reply address and its own kind and give the link, the code and the validity WHEN the mail %o is built",
			(build, kind) => {
				// Act
				const mail = build(PARAMETERS);

				// Assert
				expect(mail).toMatchObject({
					kind,
					to: { email: "sam@example.com", name: null },
					replyTo: null,
				});
				expect(mail.text).toContain(PARAMETERS.linkUrl);
				expect(mail.text).toContain("Ton code : 482913");
				expect(mail.text).toContain("valables 30 minutes");
				expect(mail.html).toContain(">482913</p>");
			},
		);

		it("SHOULD NOT put the code in the subject WHEN the mail is built", () => {
			const { subject } = buildRegistrationMail(PARAMETERS);

			expect(subject).toBe("Confirme ton inscription");
			expect(subject).not.toContain(PARAMETERS.code);
		});

		it("SHOULD offer the code as an alternative to the link WHEN the mail is built", () => {
			const { text } = buildMailLoginMail(PARAMETERS);

			expect(text).toContain(
				"Par préférence ou si le lien ne fonctionne pas, tu peux aussi saisir ce code sur la page restée ouverte :",
			);
		});

		it("SHOULD tell the recipient in the body to ignore it if they did not ask for it, and quote the site name WHEN the mail is built", () => {
			const { text } = buildPasswordResetMail(PARAMETERS);

			expect(text).toContain(
				"Si tu n'es pas à l'origine de cette demande, ignore cet email : ton mot de passe actuel reste valable.",
			);
			expect(text).toContain(`le site ${MAIL_SITE.quotedName}`);
		});

		it("SHOULD use the singular WHEN the validity is one minute", () => {
			const { text } = buildRegistrationMail({
				...PARAMETERS,
				validityMinutes: 1,
			});

			expect(text).toContain("valables 1 minute.");
		});
	});
});
