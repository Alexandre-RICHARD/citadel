import { ColumnFilterKindEnum } from "@citadel/specs/src/projects/backlog/enum/columnFilterKind.enum.ts";
import { FilterModeEnum } from "@citadel/specs/src/projects/backlog/enum/filterMode.enum.ts";
import { MediaColumnEnum } from "@citadel/specs/src/projects/backlog/enum/mediaColumn.enum.ts";
import { MediaTypeEnum } from "@citadel/specs/src/projects/backlog/enum/mediaType.enum.ts";
import type { ColumnFilter } from "@citadel/specs/src/projects/backlog/helper/view/columnFilter.type.ts";
import { describe, expect, it } from "vitest";

import { buildUserMediaBean } from "../../../../testUtils/unit/backlog/buildUserMediaBean.ts";
import type { UserMediaBean } from "../../bean/userMediaBean.type.ts";
import { filterUserMediaBeans } from "./filterUserMediaBeans.ts";

const MEDIA: UserMediaBean[] = [
	buildUserMediaBean({
		id: 1,
		title: "Le Seigneur des anneaux",
		originalTitle: "The Lord of the Rings",
		isWatched: true,
	}),
	buildUserMediaBean({
		id: 2,
		mediaType: MediaTypeEnum.SHOW,
		tmdbId: 1396,
		title: "Breaking Bad",
		originalTitle: "Breaking Bad",
		saga: { id: 7, name: "Breaking Bad" },
	}),
	buildUserMediaBean({ id: 3, title: "Heat", originalLanguage: "fr" }),
];

function filterIds(
	filters: ColumnFilter<MediaColumnEnum>[],
	filterMode = FilterModeEnum.AND,
): number[] {
	return filterUserMediaBeans(MEDIA, filters, filterMode).map(({ id }) => id);
}

describe("filterUserMediaBeans.ts", () => {
	describe("columns", () => {
		it("SHOULD search the French and the original title WHEN filtering on the title", () => {
			expect(
				filterIds([
					{
						column: MediaColumnEnum.TITLE,
						kind: ColumnFilterKindEnum.TEXT,
						text: "lord",
						isExact: false,
					},
				]),
			).toStrictEqual([1]);
		});

		it.each([
			{
				reason: "the type",
				filter: {
					column: MediaColumnEnum.MEDIA_TYPE,
					kind: ColumnFilterKindEnum.VALUE,
					values: [MediaTypeEnum.SHOW],
				} satisfies ColumnFilter<MediaColumnEnum>,
				expected: [2],
			},
			{
				reason: "the original language",
				filter: {
					column: MediaColumnEnum.ORIGINAL_LANGUAGE,
					kind: ColumnFilterKindEnum.VALUE,
					values: ["fr"],
				} satisfies ColumnFilter<MediaColumnEnum>,
				expected: [3],
			},
			{
				reason: "the watched box",
				filter: {
					column: MediaColumnEnum.WATCHED,
					kind: ColumnFilterKindEnum.BOOLEAN,
					value: true,
				} satisfies ColumnFilter<MediaColumnEnum>,
				expected: [1],
			},
			{
				reason: "the TMDB id",
				filter: {
					column: MediaColumnEnum.TMDB_ID,
					kind: ColumnFilterKindEnum.TEXT,
					text: "1396",
					isExact: true,
				} satisfies ColumnFilter<MediaColumnEnum>,
				expected: [2],
			},
		])(
			"SHOULD keep the matching rows WHEN filtering on $reason",
			({ filter, expected }) => {
				expect(filterIds([filter])).toStrictEqual(expected);
			},
		);
	});

	describe("combination", () => {
		const filters: ColumnFilter<MediaColumnEnum>[] = [
			{
				column: MediaColumnEnum.WATCHED,
				kind: ColumnFilterKindEnum.BOOLEAN,
				value: true,
			},
			{
				column: MediaColumnEnum.SAGA,
				kind: ColumnFilterKindEnum.TEXT,
				text: "Breaking Bad",
				isExact: true,
			},
		];

		it("SHOULD keep the rows that pass every filter WHEN they combine with and", () => {
			expect(filterIds(filters)).toStrictEqual([]);
		});

		it("SHOULD keep the rows that pass one filter WHEN they combine with or", () => {
			expect(filterIds(filters, FilterModeEnum.OR)).toStrictEqual([1, 2]);
		});

		it("SHOULD keep every row WHEN there is no filter", () => {
			expect(filterIds([])).toStrictEqual([1, 2, 3]);
		});
	});
});
