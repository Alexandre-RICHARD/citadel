import { describe, expect, it } from "vitest";

import { getIssues } from "../../../testUtils/getIssues.ts";
import { booleanSchema } from "./booleanSchema.ts";

const schema = booleanSchema("Defeated");

describe("booleanSchema.ts", () => {
	describe("accepted values", () => {
		it.each([true, false])("SHOULD accept the value WHEN it is %s", (value) => {
			expect(schema.safeParse(value)).toStrictEqual({
				success: true,
				data: value,
			});
		});
	});

	describe("rejected values", () => {
		it.each([
			{ reason: 'the string "true"', value: "true" },
			{ reason: 'the string "false"', value: "false" },
			{ reason: "the number 1", value: 1 },
			{ reason: "the number 0", value: 0 },
			{ reason: "null", value: null },
			{ reason: "undefined", value: undefined },
			{ reason: "an object", value: {} },
			{ reason: "an array", value: [true] },
		])("SHOULD reject the value WHEN it is $reason", ({ value }) => {
			expect(getIssues(schema.safeParse(value))).toStrictEqual([
				{ path: [], message: "Defeated should be a boolean" },
			]);
		});
	});
});
