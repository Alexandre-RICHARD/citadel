import { BacklogColumnEnum } from "@citadel/specs/src/projects/backlog/enum/backlogColumn.enum.ts";
import { ColumnFilterKindEnum } from "@citadel/specs/src/projects/backlog/enum/columnFilterKind.enum.ts";
import { FilterModeEnum } from "@citadel/specs/src/projects/backlog/enum/filterMode.enum.ts";
import type { ColumnFilter } from "@citadel/specs/src/projects/backlog/helper/view/columnFilter.type.ts";
import { describe, expect, it } from "vitest";

import { buildViewRow } from "../../../testUtils/unit/backlog/buildViewRow.ts";
import type { UserGameBean } from "../bean/userGameBean.type.ts";
import { filterUserGameViews } from "./filterUserGameViews.ts";
import type { UserGameView } from "./userGameView.type.ts";
import type { ViewRow } from "./viewRow.type.ts";

// Le filtre ne lit que les lignes : le jeu stocké n'est qu'un passager
function buildView(
	row: Partial<ViewRow>,
	userVersionRows: Partial<ViewRow>[] = [],
): UserGameView {
	return {
		userGame: {} as UserGameBean,
		row: buildViewRow(row),
		userVersionRows: userVersionRows.map((userVersionRow) =>
			buildViewRow({ ...row, ...userVersionRow }),
		),
	};
}

function filterNames(
	views: UserGameView[],
	filters: ColumnFilter[],
	filterMode = FilterModeEnum.AND,
): string[] {
	return filterUserGameViews(views, filters, filterMode).map(
		({ row }) => row.name,
	);
}

describe("filterUserGameViews.ts", () => {
	describe("text filters", () => {
		const views = [
			buildView({ name: "Pokemon", frenchName: "Pokémon Rouge" }),
			buildView({ name: "Zelda", versionTitle: "Édition Switch" }),
		];

		it("SHOULD search the French name, the name and the version title, without accents or case", () => {
			expect(
				filterNames(views, [
					{
						column: BacklogColumnEnum.NAME,
						kind: ColumnFilterKindEnum.TEXT,
						text: "edition",
						isExact: false,
					},
				]),
			).toStrictEqual(["Zelda"]);
		});

		it("SHOULD need the whole text WHEN the filter is exact", () => {
			const seriesViews = [
				buildView({ name: "A", seriesName: "The Witcher" }),
				buildView({ name: "B", seriesName: "The Witcher Tales" }),
			];

			expect(
				filterNames(seriesViews, [
					{
						column: BacklogColumnEnum.SERIES,
						kind: ColumnFilterKindEnum.TEXT,
						text: "the witcher",
						isExact: true,
					},
				]),
			).toStrictEqual(["A"]);
		});
	});

	describe("ranges", () => {
		const views = [
			buildView({ name: "low", rating: 8 }),
			buildView({ name: "high", rating: 18 }),
			buildView({ name: "unrated", rating: null }),
		];

		it("SHOULD keep the values inside the bounds, bounds included", () => {
			expect(
				filterNames(views, [
					{
						column: BacklogColumnEnum.RATING,
						kind: ColumnFilterKindEnum.NUMBER_RANGE,
						min: 10,
						max: 18,
					},
				]),
			).toStrictEqual(["high"]);
		});

		it("SHOULD drop the empty cells WHEN a range is set", () => {
			expect(
				filterNames(views, [
					{
						column: BacklogColumnEnum.RATING,
						kind: ColumnFilterKindEnum.NUMBER_RANGE,
						min: null,
						max: 20,
					},
				]),
			).toStrictEqual(["low", "high"]);
		});
	});

	describe("played versions", () => {
		it("SHOULD keep a game WHEN one of its played versions matches every filter", () => {
			const views = [
				buildView({ name: "multi", platformName: null }, [
					{ platformName: "PS2" },
					{ platformName: "PS4" },
				]),
				buildView({ name: "pc only", platformName: "PC" }),
			];

			expect(
				filterNames(views, [
					{
						column: BacklogColumnEnum.PLATFORM,
						kind: ColumnFilterKindEnum.VALUE,
						values: ["PS4"],
					},
				]),
			).toStrictEqual(["multi"]);
		});

		it("SHOULD keep a game WHEN one of its played versions has any of the checked values", () => {
			const views = [
				buildView({ name: "multi", platformName: null }, [
					{ platformName: "PS2" },
					{ platformName: "PS4" },
				]),
				buildView({ name: "pc only", platformName: "PC" }),
				buildView({ name: "switch only", platformName: "Switch" }),
			];

			expect(
				filterNames(views, [
					{
						column: BacklogColumnEnum.PLATFORM,
						kind: ColumnFilterKindEnum.VALUE,
						values: ["PS4", "PC"],
					},
				]),
			).toStrictEqual(["multi", "pc only"]);
		});
	});

	describe("filter mode", () => {
		const views = [
			buildView({ name: "Zelda", platformName: "Switch" }),
			buildView({ name: "Biz", platformName: "PS5" }),
			buildView({ name: "Mario", platformName: "Switch" }),
			buildView({ name: "Other", platformName: "PS5" }),
		];
		const filters: ColumnFilter[] = [
			{
				column: BacklogColumnEnum.PLATFORM,
				kind: ColumnFilterKindEnum.VALUE,
				values: ["PS5"],
			},
			{
				column: BacklogColumnEnum.NAME,
				kind: ColumnFilterKindEnum.TEXT,
				text: "zel",
				isExact: false,
			},
		];

		it("SHOULD keep the games that pass every filter WHEN the mode is and", () => {
			expect(filterNames(views, filters, FilterModeEnum.AND)).toStrictEqual([]);
		});

		it("SHOULD keep the games that pass at least one filter WHEN the mode is or", () => {
			expect(filterNames(views, filters, FilterModeEnum.OR)).toStrictEqual([
				"Zelda",
				"Biz",
				"Other",
			]);
		});
	});

	describe("no filter", () => {
		it("SHOULD keep every game WHEN there is no filter", () => {
			const views = [buildView({ name: "A" })];

			expect(filterUserGameViews(views, [], FilterModeEnum.AND)).toBe(views);
		});
	});
});
