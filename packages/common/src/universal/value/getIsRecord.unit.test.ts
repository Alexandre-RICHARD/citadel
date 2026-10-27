import { describe, expect, it } from "vitest";

import { getIsRecord } from "./getIsRecord.ts";

describe("getIsRecord.ts", () => {
	describe("objects", () => {
		it.each([{ value: {} }, { value: { code: "X" } }, { value: [] }])(
			"SHOULD return true WHEN the value is $value",
			({ value }) => {
				expect(getIsRecord(value)).toBe(true);
			},
		);
	});

	describe("other values", () => {
		it.each([
			{ value: null },
			{ value: undefined },
			{ value: "text" },
			{ value: 42 },
			{ value: true },
		])("SHOULD return false WHEN the value is $value", ({ value }) => {
			expect(getIsRecord(value)).toBe(false);
		});
	});
});
