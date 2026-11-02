import { describe, expect, it } from "vitest";

import { isEmailAddress } from "./isEmailAddress.ts";

describe("isEmailAddress.ts", () => {
	describe("addresses", () => {
		it.each([
			{ reason: "a plain address", value: "alex@example.com" },
			{ reason: "an accented address", value: "josé@exemple.fr" },
			{
				reason: "a tag and a subdomain",
				value: "alex.d+jeux@mail.example.fr",
			},
		])("SHOULD accept $reason", ({ value }) => {
			expect(isEmailAddress(value)).toBe(true);
		});
	});

	describe("not addresses", () => {
		it.each([
			{ reason: "a username", value: "Alex" },
			{ reason: "a missing domain", value: "alex@" },
			{ reason: "a domain without extension", value: "alex@example" },
			{ reason: "a space inside", value: "alex dupont@example.com" },
			{ reason: "two at signs", value: "alex@home@example.com" },
		])("SHOULD refuse $reason", ({ value }) => {
			expect(isEmailAddress(value)).toBe(false);
		});
	});
});
