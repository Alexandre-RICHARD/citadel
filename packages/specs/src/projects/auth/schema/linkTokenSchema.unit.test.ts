import { describe, expect, it } from "vitest";

import { ValidationIssueCodeEnum } from "../../../specUtils/error/validationIssueCode.enum.ts";
import { getIssues } from "../../../testUtils/getIssues.ts";
import { linkTokenSchema } from "./linkTokenSchema.ts";

const TOKEN = "Zm9vYmFyLWJhei1xdXV4LWNvcmdlLWdyYXVsdC1nYXJ";

describe("linkTokenSchema.ts", () => {
	describe("accepted tokens", () => {
		it("SHOULD keep a token WHEN it has 43 base64url characters", () => {
			expect(linkTokenSchema.parse(TOKEN)).toBe(TOKEN);
		});
	});

	describe("refused tokens", () => {
		it.each([
			{ reason: "a token too short", value: TOKEN.slice(1) },
			{ reason: "a token too long", value: `${TOKEN}a` },
			{ reason: "a padding sign", value: `${TOKEN.slice(1)}=` },
			{ reason: "a base64 slash", value: `${TOKEN.slice(1)}/` },
		])("SHOULD refuse $reason", ({ value }) => {
			expect(getIssues(linkTokenSchema.safeParse(value))).toMatchObject([
				{ code: ValidationIssueCodeEnum.INVALID_FORMAT },
			]);
		});
	});
});
