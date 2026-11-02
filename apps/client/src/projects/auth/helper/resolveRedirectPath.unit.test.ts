import { describe, expect, it } from "vitest";

import { resolveRedirectPath } from "./resolveRedirectPath";

const FALLBACK = "/homepage";

describe("resolveRedirectPath.ts", () => {
	describe("pages of the site", () => {
		it.each(["/backlog", "/game-death-counter?tab=2#boss"])(
			"SHOULD go back to %s",
			(redirect) => {
				expect(resolveRedirectPath(redirect, FALLBACK)).toBe(redirect);
			},
		);
	});

	describe("anything else", () => {
		it.each([
			{ reason: "no page was asked for", redirect: null },
			{ reason: "another site", redirect: "https://ailleurs.example" },
			{ reason: "another site without scheme", redirect: "//ailleurs.example" },
			{ reason: "a backslash trick", redirect: "/\\ailleurs.example" },
			{ reason: "a relative path", redirect: "backlog" },
		])("SHOULD go to the fallback WHEN $reason", ({ redirect }) => {
			expect(resolveRedirectPath(redirect, FALLBACK)).toBe(FALLBACK);
		});
	});
});
