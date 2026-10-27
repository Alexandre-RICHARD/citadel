import { describe, expect, it } from "vitest";

import { sortParamSchema } from "./sortParamSchema.ts";

describe("sortParamSchema.ts", () => {
	describe("accepted values", () => {
		it("SHOULD keep a readable sort as text, read later by the server", () => {
			expect(
				sortParamSchema.safeParse("releaseDate:desc,name:asc"),
			).toStrictEqual({ success: true, data: "releaseDate:desc,name:asc" });
		});

		it("SHOULD default to no sort WHEN the param is missing", () => {
			expect(sortParamSchema.safeParse(undefined)).toStrictEqual({
				success: true,
				data: "",
			});
		});
	});

	describe("rejected values", () => {
		it.each([
			{ reason: "a column cannot be sorted", value: "thumbnail:asc" },
			{ reason: "the direction is unknown", value: "name:up" },
			{ reason: "a column appears twice", value: "name:asc,name:desc" },
		])("SHOULD refuse the sort WHEN $reason", ({ value }) => {
			expect(sortParamSchema.safeParse(value).success).toBe(false);
		});
	});
});
