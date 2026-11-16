import { describe, expect, it } from "vitest";

import { isUnlockTokenValid } from "./isUnlockTokenValid.ts";
import { signUnlockToken } from "./signUnlockToken.ts";

const KEY = "media-password-hash";
const NOW = 1_000_000;

describe("isUnlockTokenValid.ts", () => {
	describe("valid token", () => {
		it("SHOULD open the connected mode to its account before its end", () => {
			expect(
				isUnlockTokenValid(signUnlockToken(7, NOW + 1, KEY), 7, KEY, NOW),
			).toBe(true);
		});
	});

	describe("refused token", () => {
		it.each([
			{
				reason: "it has expired",
				token: signUnlockToken(7, NOW, KEY),
				userId: 7,
			},
			{
				reason: "it belongs to another account",
				token: signUnlockToken(8, NOW + 1, KEY),
				userId: 7,
			},
			{
				reason: "the media password has changed",
				token: signUnlockToken(7, NOW + 1, "another-hash"),
				userId: 7,
			},
			{
				reason: "its end has been tampered with",
				token: signUnlockToken(7, NOW + 1, KEY).replace(
					`.${NOW + 1}.`,
					`.${NOW + 99}.`,
				),
				userId: 7,
			},
			{ reason: "it is unreadable", token: "nope", userId: 7 },
			{ reason: "there is no cookie", token: undefined, userId: 7 },
		])("SHOULD refuse it WHEN $reason", ({ token, userId }) => {
			expect(isUnlockTokenValid(token, userId, KEY, NOW)).toBe(false);
		});
	});
});
