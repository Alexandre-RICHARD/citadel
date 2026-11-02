import { describe, expect, it } from "vitest";

import { readMailLimitAddress } from "./readMailLimitAddress.ts";

const EMAIL = "alex@example.com";

describe("readMailLimitAddress.ts", () => {
	describe("typed identifier", () => {
		it.each([
			{ reason: "parsed", payload: { identifier: "Alex" } },
			{ reason: "as text", payload: JSON.stringify({ identifier: "Alex" }) },
		])(
			"SHOULD give the typed identifier WHEN the flow keeps it, $reason",
			({ payload }) => {
				expect(readMailLimitAddress({ email: EMAIL, payload })).toBe("Alex");
			},
		);
	});

	describe("mail address", () => {
		it.each([
			{ reason: "the flow has no payload", payload: null },
			{
				reason: "the payload is a registration",
				payload: { username: "Alex", passwordHash: "argon2id:hash" },
			},
		])("SHOULD give the mail address WHEN $reason", ({ payload }) => {
			expect(readMailLimitAddress({ email: EMAIL, payload })).toBe(EMAIL);
		});
	});
});
