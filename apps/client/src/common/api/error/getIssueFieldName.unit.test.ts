import { describe, expect, it } from "vitest";

import { getIssueFieldName } from "./getIssueFieldName";

describe("getIssueFieldName.ts", () => {
	describe("named fields", () => {
		it.each([
			{ reason: "a field of the body", path: ["name"], expected: "name" },
			{
				reason: "a field of a nested block",
				path: ["customization", "seriesNumber"],
				expected: "seriesNumber",
			},
			{
				reason: "an item of a list",
				path: ["entries", 2, "seriesNumber"],
				expected: "seriesNumber",
			},
			{
				reason: "a whole list",
				path: ["versionIds", 0],
				expected: "versionIds",
			},
		])(
			"SHOULD give the deepest name WHEN the issue is on $reason",
			({ path, expected }) => {
				expect(getIssueFieldName(path)).toBe(expected);
			},
		);
	});

	describe("whole body", () => {
		it("SHOULD give nothing WHEN the issue is on the whole body", () => {
			expect(getIssueFieldName([])).toBeUndefined();
		});
	});
});
