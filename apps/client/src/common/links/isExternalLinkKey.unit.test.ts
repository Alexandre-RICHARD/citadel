import { describe, expect, it } from "vitest";

import { isExternalLinkKey } from "./isExternalLinkKey";

describe("isExternalLinkKey.ts", () => {
	describe("keys", () => {
		it("SHOULD accept a key WHEN the dictionary has it", () => {
			expect(isExternalLinkKey("cloudflarePrivacy")).toBe(true);
		});

		it.each([
			{ reason: "unknown", key: "nowhere" },
			{ reason: "inherited from Object", key: "toString" },
		])("SHOULD refuse a key WHEN it is $reason", ({ key }) => {
			expect(isExternalLinkKey(key)).toBe(false);
		});
	});
});
