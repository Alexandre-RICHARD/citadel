import { describe, expect, it } from "vitest";

import { BacklogColumnEnum } from "../enum/backlogColumn.enum.ts";
import { filterParamSchema } from "./filterParamSchema.ts";

describe("filterParamSchema.ts", () => {
	describe("accepted values", () => {
		it.each([
			{ column: BacklogColumnEnum.NAME, value: "zelda" },
			{ column: BacklogColumnEnum.RATING, value: "10..18" },
			{ column: BacklogColumnEnum.OWNED, value: "oui" },
		])(
			"SHOULD keep the filter as text WHEN $column is $value",
			({ column, value }) => {
				expect(filterParamSchema(column).safeParse(value)).toStrictEqual({
					success: true,
					data: value,
				});
			},
		);

		it("SHOULD accept a missing filter", () => {
			expect(
				filterParamSchema(BacklogColumnEnum.NAME).safeParse(undefined).success,
			).toBe(true);
		});
	});

	describe("rejected values", () => {
		it.each([
			{ column: BacklogColumnEnum.RATING, value: "high" },
			{ column: BacklogColumnEnum.OWNED, value: "maybe" },
		])(
			"SHOULD refuse the filter WHEN $column is $value",
			({ column, value }) => {
				expect(filterParamSchema(column).safeParse(value).success).toBe(false);
			},
		);
	});
});
