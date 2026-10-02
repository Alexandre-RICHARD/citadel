import { describe, expect, it } from "vitest";

import { getIssues } from "../../../testUtils/getIssues.ts";
import { bodyIdSchema } from "./bodyIdSchema.ts";
import { IdBoundEnum } from "./idBound.enum.ts";

const schema = bodyIdSchema("Game ID");

describe("bodyIdSchema.ts", () => {
	describe("accepted values", () => {
		it.each([
			{ reason: "the smallest id", value: IdBoundEnum.MIN },
			{ reason: "a common id", value: 42 },
			{ reason: "the largest id of an INT column", value: IdBoundEnum.MAX },
			{ reason: "written 2.0 in JSON, identical to 2", value: 2.0 },
		])("SHOULD accept the id WHEN it is $reason", ({ value }) => {
			expect(schema.safeParse(value)).toStrictEqual({
				success: true,
				data: value,
			});
		});
	});

	describe("rejected types", () => {
		it.each([
			{ reason: "a number written as a string", value: "3" },
			{ reason: "null", value: null },
			{ reason: "undefined", value: undefined },
			{ reason: "NaN", value: Number.NaN },
			{ reason: "Infinity", value: Number.POSITIVE_INFINITY },
			{ reason: "a boolean", value: true },
		])("SHOULD ask for a JSON number WHEN the id is $reason", ({ value }) => {
			expect(getIssues(schema.safeParse(value))).toStrictEqual([
				{
					path: [],
					message:
						'Game ID should be a JSON number, not text (e.g. 7, not "7")',
				},
			]);
		});
	});

	describe("rejected numbers", () => {
		it.each([
			{ value: 1.5, message: "Game ID should be an integer (e.g. 7, not 7.5)" },
			{ value: 0, message: "Game ID should be at least 1" },
			{ value: -2, message: "Game ID should be at least 1" },
			{
				value: IdBoundEnum.MAX + 1,
				message: `Game ID should be at most ${IdBoundEnum.MAX}`,
			},
		])("SHOULD reject the id WHEN it is $value", ({ value, message }) => {
			expect(getIssues(schema.safeParse(value))).toStrictEqual([
				{ path: [], message },
			]);
		});
	});
});
