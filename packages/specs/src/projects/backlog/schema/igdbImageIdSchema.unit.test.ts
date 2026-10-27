import { describe, expect, it } from "vitest";

import { getIssues } from "../../../testUtils/getIssues.ts";
import { igdbImageIdSchema } from "./igdbImageIdSchema.ts";

const schema = igdbImageIdSchema("Image ID");

describe("igdbImageIdSchema.ts", () => {
	describe("accepted values", () => {
		it("SHOULD accept an IGDB image id", () => {
			expect(schema.safeParse("co1tnw")).toStrictEqual({
				success: true,
				data: "co1tnw",
			});
		});
	});

	describe("rejected values", () => {
		it.each([
			{ reason: "it has upper case letters", value: "Co1tnw" },
			{ reason: "it is a URL", value: "https://images.igdb.com/co1tnw.jpg" },
			{ reason: "it is empty", value: "" },
		])("SHOULD refuse the id WHEN $reason", ({ value }) => {
			expect(
				getIssues(schema.safeParse(value)).map((issue) => issue.message),
			).toStrictEqual([
				"Image ID should only contain lowercase letters and digits",
			]);
		});

		it("SHOULD refuse the id WHEN it is longer than 100 characters", () => {
			expect(
				getIssues(schema.safeParse("a".repeat(101))).map(
					(issue) => issue.message,
				),
			).toStrictEqual(["Image ID should contain at most 100 characters"]);
		});
	});
});
