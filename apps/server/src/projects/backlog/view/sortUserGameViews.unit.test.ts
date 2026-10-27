import { BacklogColumnEnum } from "@citadel/specs/src/projects/backlog/enum/backlogColumn.enum.ts";
import { SortDirectionEnum } from "@citadel/specs/src/projects/backlog/enum/sortDirection.enum.ts";
import { StatusEnum } from "@citadel/specs/src/projects/backlog/enum/status.enum.ts";
import { describe, expect, it } from "vitest";

import { buildViewRow } from "../../../testUtils/unit/backlog/buildViewRow.ts";
import type { UserGameBean } from "../bean/userGameBean.type.ts";
import { sortUserGameViews } from "./sortUserGameViews.ts";
import type { UserGameView } from "./userGameView.type.ts";
import type { ViewRow } from "./viewRow.type.ts";

// Le tri ne lit que la ligne : le jeu stocké n'est qu'un passager
function buildView(row: Partial<ViewRow>): UserGameView {
	return {
		userGame: {} as UserGameBean,
		row: buildViewRow(row),
		userVersionRows: [],
	};
}

function getNames(views: UserGameView[]): string[] {
	return views.map(({ row }) => row.name);
}

describe("sortUserGameViews.ts", () => {
	describe("texts", () => {
		it("SHOULD sort in French, ignoring accents and case, numbers in order", () => {
			const views = ["FF10", "éclair", "Zelda", "FF2"].map((name) =>
				buildView({ name }),
			);

			expect(
				getNames(
					sortUserGameViews(views, [
						{
							column: BacklogColumnEnum.NAME,
							direction: SortDirectionEnum.ASC,
						},
					]),
				),
			).toStrictEqual(["éclair", "FF2", "FF10", "Zelda"]);
		});
	});

	describe("statuses and boxes", () => {
		it("SHOULD sort the statuses in their defined order", () => {
			const views = [
				buildView({ name: "finished", status: StatusEnum.FINISHED }),
				buildView({ name: "started", status: StatusEnum.STARTED }),
			];

			expect(
				getNames(
					sortUserGameViews(views, [
						{
							column: BacklogColumnEnum.STATUS,
							direction: SortDirectionEnum.ASC,
						},
					]),
				),
			).toStrictEqual(["started", "finished"]);
		});

		it("SHOULD put checked boxes first WHEN the order is descending", () => {
			const views = [
				buildView({ name: "not owned", isOwned: false }),
				buildView({ name: "owned", isOwned: true }),
			];

			expect(
				getNames(
					sortUserGameViews(views, [
						{
							column: BacklogColumnEnum.OWNED,
							direction: SortDirectionEnum.DESC,
						},
					]),
				),
			).toStrictEqual(["owned", "not owned"]);
		});
	});

	describe("empty cells", () => {
		it.each([SortDirectionEnum.ASC, SortDirectionEnum.DESC])(
			"SHOULD put the empty cells last WHEN the order is %s",
			(direction) => {
				const views = [
					buildView({ name: "no rating", rating: null }),
					buildView({ name: "rated", rating: 12 }),
				];

				expect(
					getNames(
						sortUserGameViews(views, [
							{ column: BacklogColumnEnum.RATING, direction },
						]),
					),
				).toStrictEqual(["rated", "no rating"]);
			},
		);
	});

	describe("several criteria", () => {
		it("SHOULD use the next criterion WHEN two rows are equal on the first", () => {
			const views = [
				buildView({ name: "B", rating: 10 }),
				buildView({ name: "A", rating: 10 }),
				buildView({ name: "C", rating: 15 }),
			];

			expect(
				getNames(
					sortUserGameViews(views, [
						{
							column: BacklogColumnEnum.RATING,
							direction: SortDirectionEnum.DESC,
						},
						{
							column: BacklogColumnEnum.NAME,
							direction: SortDirectionEnum.ASC,
						},
					]),
				),
			).toStrictEqual(["C", "A", "B"]);
		});

		it("SHOULD keep the order of addition WHEN there is no criterion", () => {
			const views = [buildView({ name: "B" }), buildView({ name: "A" })];

			expect(sortUserGameViews(views, [])).toBe(views);
		});
	});
});
