import { describe, expect, it } from "vitest";

import { getIssues } from "../../../testUtils/getIssues.ts";
import { platformIdSchema } from "./platformIdSchema.ts";

const schema = platformIdSchema("Platform ID");

describe("platformIdSchema.ts", () => {
	describe("accepted values", () => {
		it.each([
			{ reason: "an IGDB id", value: 8 },
			{ reason: "an emulator id, negative", value: -2 },
		])("SHOULD accept the id WHEN it is $reason", ({ value }) => {
			expect(schema.safeParse(value)).toStrictEqual({
				success: true,
				data: value,
			});
		});
	});

	describe("rejected values", () => {
		it.each([
			{
				reason: "0",
				value: 0,
				message: "Platform ID should not be 0",
			},
			{
				reason: "a decimal number",
				value: 7.5,
				message: "Platform ID should be an integer (e.g. 7, not 7.5)",
			},
			{
				reason: "a number written as text",
				value: "7",
				message:
					'Platform ID should be a JSON number, not text (e.g. 7, not "7")',
			},
		])("SHOULD refuse the id WHEN it is $reason", ({ value, message }) => {
			expect(
				getIssues(schema.safeParse(value)).map((issue) => issue.message),
			).toStrictEqual([message]);
		});
	});
});
