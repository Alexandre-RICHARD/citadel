import { describe, expect, it } from "vitest";

import { buildUserGameBean } from "../../../testUtils/unit/backlog/buildUserGameBean.ts";
import { buildUserVersionBean } from "../../../testUtils/unit/backlog/buildUserVersionBean.ts";
import { buildUserGameView } from "./buildUserGameView.ts";
import { sortUserVersionsByActivity } from "./sortUserVersionsByActivity.ts";

function buildView(...updatedAts: string[]) {
	return buildUserGameView(
		buildUserGameBean(
			"Dead Space",
			updatedAts.map((updatedAt, index) =>
				buildUserVersionBean(index + 1, `P${index + 1}`, {
					updatedAt: new Date(updatedAt),
				}),
			),
		),
	);
}

describe("sortUserVersionsByActivity.ts", () => {
	describe("played versions", () => {
		it("SHOULD put the most recently touched version first, in the game and in its rows", () => {
			const [view] = sortUserVersionsByActivity([
				buildView(
					"2026-01-01T00:00:00Z",
					"2026-03-01T00:00:00Z",
					"2026-02-01T00:00:00Z",
				),
			]);

			expect(view?.userGame.userVersions.map(({ id }) => id)).toStrictEqual([
				2, 3, 1,
			]);
			expect(
				view?.userVersionRows.map(({ platformName }) => platformName),
			).toStrictEqual(["P2", "P3", "P1"]);
		});

		it("SHOULD keep the order of addition WHEN they were touched together", () => {
			const view = buildView("2026-01-01T00:00:00Z", "2026-01-01T00:00:00Z");

			expect(sortUserVersionsByActivity([view])).toStrictEqual([view]);
		});
	});
});
