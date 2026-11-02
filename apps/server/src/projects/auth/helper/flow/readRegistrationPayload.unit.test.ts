import { describe, expect, it } from "vitest";

import { readRegistrationPayload } from "./readRegistrationPayload.ts";

const PAYLOAD = {
	username: "Alex",
	passwordHash: "argon2id:m=64,t=1,p=1:c2Vs:aGFzaA",
};

describe("readRegistrationPayload.ts", () => {
	describe("readable payloads", () => {
		it("SHOULD give the waiting account WHEN the column arrives parsed", () => {
			expect(readRegistrationPayload(PAYLOAD)).toStrictEqual(PAYLOAD);
		});

		it("SHOULD give the waiting account WHEN the column arrives as text", () => {
			expect(readRegistrationPayload(JSON.stringify(PAYLOAD))).toStrictEqual(
				PAYLOAD,
			);
		});
	});

	describe("unreadable payloads", () => {
		it.each([
			{ reason: "empty", payload: null },
			{ reason: "an email change", payload: { newEmail: "alex@example.com" } },
			{ reason: "missing its hash", payload: { username: "Alex" } },
		])("SHOULD throw WHEN the payload is $reason", ({ payload }) => {
			expect(() => readRegistrationPayload(payload)).toThrow(
				"Unreadable registration payload",
			);
		});
	});
});
