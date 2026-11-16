import { describe, expect, it } from "vitest";

import { gameColumnFilterKinds } from "../helper/view/gameColumnFilterKinds.ts";
import { sortParamSchema } from "./sortParamSchema.ts";

const gameSortParamSchema = sortParamSchema(gameColumnFilterKinds);

describe("sortParamSchema.ts", () => {
	describe("accepted values", () => {
		it("SHOULD keep a readable sort as text, read later by the server", () => {
			expect(
				gameSortParamSchema.safeParse("releaseDate:desc,name:asc"),
			).toStrictEqual({ success: true, data: "releaseDate:desc,name:asc" });
		});

		it("SHOULD default to no sort WHEN the param is missing", () => {
			expect(gameSortParamSchema.safeParse(undefined)).toStrictEqual({
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
			expect(gameSortParamSchema.safeParse(value).success).toBe(false);
		});
	});
});
