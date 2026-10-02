import { describe, expect, it } from "vitest";

import { getIssues } from "../../../testUtils/getIssues.ts";
import { IdBoundEnum } from "./idBound.enum.ts";
import { pathParamIdSchema } from "./pathParamIdSchema.ts";

const schema = pathParamIdSchema("ID");

const FORMAT_MESSAGE =
	"ID has an invalid number format: only digits from 0 to 9 are accepted, without leading zero (e.g. 7 or 42)";

describe("pathParamIdSchema.ts", () => {
	describe("accepted values", () => {
		it.each([
			{ pathValue: "1", id: 1 },
			{ pathValue: "10", id: 10 },
			{ pathValue: "42", id: 42 },
			{ pathValue: String(IdBoundEnum.MAX), id: IdBoundEnum.MAX },
		])(
			"SHOULD return $id WHEN the path value is $pathValue",
			({ pathValue, id }) => {
				expect(schema.safeParse(pathValue)).toStrictEqual({
					success: true,
					data: id,
				});
			},
		);
	});

	describe("rejected formats", () => {
		it.each([
			{ reason: "text", pathValue: "abc" },
			{ reason: "an empty string", pathValue: "" },
			{ reason: "a number followed by text", pathValue: "12abc" },
			{ reason: "Infinity", pathValue: "Infinity" },
			{ reason: "NaN", pathValue: "NaN" },
			{ reason: "a decimal", pathValue: "1.5" },
			{ reason: "an integer followed by a dot", pathValue: "5." },
			{ reason: "a negative number", pathValue: "-7" },
			{ reason: "preceded by a plus sign", pathValue: "+5" },
			{ reason: "written with leading zeros", pathValue: "007" },
			{ reason: "only zeros", pathValue: "00" },
			{ reason: "in scientific notation", pathValue: "1e3" },
			{ reason: "in hexadecimal", pathValue: "0x10" },
			{ reason: "in binary", pathValue: "0b11" },
			{ reason: "in octal", pathValue: "0o7" },
			{ reason: "written with a thousands separator", pathValue: "1_000" },
			{ reason: "a space", pathValue: " " },
			{ reason: "surrounded by spaces", pathValue: " 7 " },
			{ reason: "followed by a line break", pathValue: "7\n" },
			{ reason: "written in Eastern Arabic digits", pathValue: "٧" },
		])(
			"SHOULD describe the accepted format WHEN the path value is $reason",
			({ pathValue }) => {
				expect(getIssues(schema.safeParse(pathValue))).toStrictEqual([
					{ path: [], message: FORMAT_MESSAGE },
				]);
			},
		);
	});

	describe("rejected bounds", () => {
		it.each([
			{
				reason: "zero, well written but below the minimum",
				pathValue: "0",
				message: `ID should be at least ${IdBoundEnum.MIN}`,
			},
			{
				reason: "beyond the maximum of an INT column",
				pathValue: String(IdBoundEnum.MAX + 1),
				message: `ID should be at most ${IdBoundEnum.MAX}`,
			},
			{
				reason: "too long to be an exact JavaScript number",
				pathValue: "99999999999999999999",
				message: `ID should be at most ${IdBoundEnum.MAX}`,
			},
		])("SHOULD reject the id WHEN it is $reason", ({ pathValue, message }) => {
			expect(getIssues(schema.safeParse(pathValue))).toStrictEqual([
				{ path: [], message },
			]);
		});
	});

	describe("rejected types", () => {
		it.each([
			{ reason: "an already converted number", value: 12 },
			{ reason: "undefined", value: undefined },
			{ reason: "null", value: null },
		])(
			"SHOULD reject the value WHEN it is $reason, since a path param is always a string",
			({ value }) => {
				expect(getIssues(schema.safeParse(value))).toStrictEqual([
					{ path: [], message: "ID should be a number" },
				]);
			},
		);
	});
});
