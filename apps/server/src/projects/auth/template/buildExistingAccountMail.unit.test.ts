import { describe, expect, it } from "vitest";

import { MailKindEnum } from "../../../mail/mailKind.enum.ts";
import { buildExistingAccountMail } from "./buildExistingAccountMail.ts";

const NOW = new Date("2026-11-02T12:00:00.000Z");

describe("buildExistingAccountMail.ts", () => {
	describe("mail", () => {
		it("SHOULD say when the account was last used and link to the login page WHEN the address is already registered", () => {
			// Act
			const mail = buildExistingAccountMail(
				"sam@example.com",
				new Date("2026-10-12T12:00:00.000Z"),
				NOW,
			);

			// Assert
			expect(mail).toMatchObject({
				kind: MailKindEnum.AUTH_REGISTRATION_EXISTING_ACCOUNT,
				to: { email: "sam@example.com", name: null },
				subject: "Tu as déjà un compte",
			});
			expect(mail.text).toContain("Ta dernière connexion : il y a 3 semaines.");
			expect(mail.text).toContain(
				"Me connecter : https://alexandre-richard.fr/auth/login",
			);
		});

		it("SHOULD carry neither a code nor a token WHEN the address is already registered", () => {
			const { text } = buildExistingAccountMail("sam@example.com", NOW, NOW);

			expect(text).not.toContain("Ton code");
			expect(text).not.toContain("token");
		});
	});
});
