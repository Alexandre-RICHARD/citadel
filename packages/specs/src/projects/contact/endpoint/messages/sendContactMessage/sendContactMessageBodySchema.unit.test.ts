import { describe, expect, it } from "vitest";

import { ValidationIssueCodeEnum } from "../../../../../specUtils/error/validationIssueCode.enum.ts";
import { getIssues } from "../../../../../testUtils/getIssues.ts";
import { ContactFieldMaxLengthEnum } from "../../../contactFieldMaxLength.enum.ts";
import { sendContactMessageBodySchema } from "./sendContactMessageBodySchema.ts";

const VALID_BODY = {
	subject: "Une question sur le Backlog",
	message: "Bonjour,\nComment ajouter un jeu ?",
	email: "visiteur@example.com",
	name: "Sam",
	website: "",
};

describe("sendContactMessageBodySchema.ts", () => {
	describe("accepted bodies", () => {
		it("SHOULD keep every field WHEN all are filled", () => {
			expect(sendContactMessageBodySchema.parse(VALID_BODY)).toStrictEqual(
				VALID_BODY,
			);
		});

		it("SHOULD turn the optional fields into null WHEN they are left empty", () => {
			expect(
				sendContactMessageBodySchema.parse({
					...VALID_BODY,
					email: " ",
					name: "",
				}),
			).toMatchObject({ email: null, name: null });
		});

		it("SHOULD accept the honeypot WHEN a robot filled it, so that it gets no hint", () => {
			expect(
				sendContactMessageBodySchema.safeParse({
					...VALID_BODY,
					website: "https://spam.example",
				}).success,
			).toBe(true);
		});
	});

	describe("refused bodies", () => {
		it.each([
			{
				reason: "an empty subject",
				body: { ...VALID_BODY, subject: "  " },
				path: "subject",
				code: ValidationIssueCodeEnum.TOO_SHORT,
			},
			{
				reason: "a subject too long",
				body: {
					...VALID_BODY,
					subject: "a".repeat(ContactFieldMaxLengthEnum.SUBJECT + 1),
				},
				path: "subject",
				code: ValidationIssueCodeEnum.TOO_LONG,
			},
			{
				reason: "an empty message",
				body: { ...VALID_BODY, message: "" },
				path: "message",
				code: ValidationIssueCodeEnum.TOO_SHORT,
			},
			{
				reason: "an email that is not an address",
				body: { ...VALID_BODY, email: "visiteur@" },
				path: "email",
				code: ValidationIssueCodeEnum.INVALID_FORMAT,
			},
			{
				reason: "a missing honeypot",
				body: { ...VALID_BODY, website: undefined },
				path: "website",
				code: ValidationIssueCodeEnum.INVALID_TYPE,
			},
		])("SHOULD refuse $reason", ({ body, path, code }) => {
			expect(
				getIssues(sendContactMessageBodySchema.safeParse(body)),
			).toMatchObject([{ path: [path], code }]);
		});
	});
});
