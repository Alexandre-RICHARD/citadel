import { describe, expect, it } from "vitest";

import { MailKindEnum } from "../../../mail/mailKind.enum.ts";
import { buildEmailChangeAddressTakenMail } from "./buildEmailChangeAddressTakenMail.ts";

describe("buildEmailChangeAddressTakenMail.ts", () => {
	describe("mail", () => {
		it("SHOULD say another account wanted the address and change nothing WHEN the address is already registered", () => {
			// Act
			const mail = buildEmailChangeAddressTakenMail("sam@example.com");

			// Assert
			expect(mail).toMatchObject({
				kind: MailKindEnum.AUTH_EMAIL_CHANGE_ADDRESS_TAKEN,
				to: { email: "sam@example.com", name: null },
			});
			expect(mail.text).toContain(
				"Un compte avec cette adresse email existe déjà.",
			);
			expect(mail.text).toContain("rien n'a changé pour ton compte");
		});

		it("SHOULD carry neither a code nor a confirmation link WHEN the address is already registered", () => {
			const { text } = buildEmailChangeAddressTakenMail("sam@example.com");

			expect(text).not.toContain("Ton code");
			expect(text).not.toContain("/auth/verify");
		});
	});
});
