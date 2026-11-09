import { BacklogColumnEnum } from "@citadel/specs/src/projects/backlog/enum/backlogColumn.enum.ts";
import { ColumnFilterKindEnum } from "@citadel/specs/src/projects/backlog/enum/columnFilterKind.enum.ts";
import { StatusEnum } from "@citadel/specs/src/projects/backlog/enum/status.enum.ts";
import type { ColumnFilter } from "@citadel/specs/src/projects/backlog/helper/view/columnFilter.type.ts";
import { describe, expect, it } from "vitest";

import { buildUserGameBean } from "../../../testUtils/unit/backlog/buildUserGameBean.ts";
import { buildUserVersionBean } from "../../../testUtils/unit/backlog/buildUserVersionBean.ts";
import { buildUserGameView } from "./buildUserGameView.ts";
import { restrictUserGameViewsToPlatforms } from "./restrictUserGameViewsToPlatforms.ts";

function platformFilter(...values: string[]): ColumnFilter {
	return {
		column: BacklogColumnEnum.PLATFORM,
		kind: ColumnFilterKindEnum.VALUE,
		values,
	};
}

// Joué sur PS3 (fini), sur Steam (en cours) et sur RPCS3 (pas commencé)
const PS3_AND_STEAM = buildUserGameBean("Dead Space", [
	buildUserVersionBean(1, "PS3", { status: StatusEnum.FINISHED }),
	buildUserVersionBean(2, "Steam", { status: StatusEnum.STARTED }),
	buildUserVersionBean(3, "RPCS3"),
]);

describe("restrictUserGameViewsToPlatforms.ts", () => {
	describe("platform filter", () => {
		it("SHOULD keep only the versions played on the platform, and nothing played on its sub-platforms", () => {
			const [view] = restrictUserGameViewsToPlatforms(
				[buildUserGameView(PS3_AND_STEAM)],
				[platformFilter("PS3")],
			);

			expect(view?.userGame.userVersions.map(({ id }) => id)).toStrictEqual([
				1,
			]);
		});

		it("SHOULD turn the game into a simple row on the platform WHEN only one version is played on it", () => {
			const [view] = restrictUserGameViewsToPlatforms(
				[buildUserGameView(PS3_AND_STEAM)],
				[platformFilter("Steam")],
			);

			expect(view?.userVersionRows).toHaveLength(1);
			expect(view?.row).toMatchObject({
				platformName: "Steam",
				status: StatusEnum.STARTED,
			});
		});

		it("SHOULD keep an expandable row WHEN several versions are played on the platform", () => {
			const game = buildUserGameBean("Dead Space", [
				buildUserVersionBean(1, "Steam", { status: StatusEnum.FINISHED }),
				buildUserVersionBean(2, "Steam", { status: StatusEnum.STARTED }),
				buildUserVersionBean(3, "PS3"),
			]);

			const [view] = restrictUserGameViewsToPlatforms(
				[buildUserGameView(game)],
				[platformFilter("Steam")],
			);

			expect(view?.userVersionRows).toHaveLength(2);
			expect(view?.row).toMatchObject({
				platformName: null,
				status: StatusEnum.FINISHED,
			});
		});

		it("SHOULD keep the versions of every checked platform", () => {
			const [view] = restrictUserGameViewsToPlatforms(
				[buildUserGameView(PS3_AND_STEAM)],
				[platformFilter("PS3", "Steam")],
			);

			expect(view?.userGame.userVersions.map(({ id }) => id)).toStrictEqual([
				1, 2,
			]);
		});
	});

	describe("no platform filter", () => {
		it("SHOULD change nothing WHEN there is no filter", () => {
			const views = [buildUserGameView(PS3_AND_STEAM)];

			expect(restrictUserGameViewsToPlatforms(views, [])).toBe(views);
		});

		it("SHOULD change nothing WHEN the filters are on other columns", () => {
			const views = [buildUserGameView(PS3_AND_STEAM)];
			const statusFilter: ColumnFilter = {
				column: BacklogColumnEnum.STATUS,
				kind: ColumnFilterKindEnum.VALUE,
				values: [StatusEnum.FINISHED],
			};

			expect(restrictUserGameViewsToPlatforms(views, [statusFilter])).toBe(
				views,
			);
		});
	});

	describe("game fully on the platform", () => {
		it("SHOULD give back the same view", () => {
			const view = buildUserGameView(
				buildUserGameBean("Celeste", [buildUserVersionBean(1, "PS3")]),
			);

			expect(
				restrictUserGameViewsToPlatforms([view], [platformFilter("PS3")]),
			).toStrictEqual([view]);
		});
	});
});
