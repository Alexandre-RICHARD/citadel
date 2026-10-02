import { describe, expect, it } from "vitest";
import { z } from "zod";

import { getIssues } from "../../../testUtils/getIssues.ts";
import { requireAtLeastOneField } from "./requireAtLeastOneField.ts";

const schema = requireAtLeastOneField(
	z.object({
		comment: z.string().optional(),
		count: z.number().optional(),
	}),
);

const MESSAGE = "At least one of comment, count should be provided";

describe("requireAtLeastOneField.ts", () => {
	describe("accepted objects", () => {
		it.each([
			{ reason: "only the first field", value: { comment: "Missed" } },
			{ reason: "only the second field", value: { count: 3 } },
			{ reason: "both fields", value: { comment: "Missed", count: 3 } },
			{ reason: "a falsy but present value (0)", value: { count: 0 } },
			{ reason: "an empty string", value: { comment: "" } },
		])("SHOULD accept the object WHEN it has $reason", ({ value }) => {
			expect(schema.safeParse(value)).toStrictEqual({
				success: true,
				data: value,
			});
		});

		it("SHOULD strip unknown fields", () => {
			expect(schema.safeParse({ comment: "Missed", bossId: 3 })).toStrictEqual({
				success: true,
				data: { comment: "Missed" },
			});
		});
	});

	describe("rejected objects", () => {
		it.each([
			{ reason: "it is empty", value: {} },
			{
				reason: "its known fields are explicitly undefined",
				value: { comment: undefined },
			},
			{
				reason: "it only has unknown fields, stripped before the check",
				value: { bossId: 3 },
			},
		])("SHOULD list the possible fields WHEN $reason", ({ value }) => {
			expect(getIssues(schema.safeParse(value))).toStrictEqual([
				{ path: [], message: MESSAGE },
			]);
		});

		it("SHOULD only check the presence of a field WHEN every field is valid", () => {
			expect(getIssues(schema.safeParse({ count: "3" }))).toStrictEqual([
				{
					path: ["count"],
					message: "Invalid input: expected number, received string",
				},
			]);
		});
	});
});
