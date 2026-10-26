import { describe, expect, it } from "vitest";

import { StatusEnum } from "../../enum/status.enum.ts";
import type { AggregatedUserVersion } from "./aggregatedUserVersion.type.ts";
import { computeUserGameAggregates } from "./computeUserGameAggregates.ts";

const BLANK_USER_VERSION: AggregatedUserVersion = {
	status: StatusEnum.NOT_STARTED,
	isOwned: false,
	isUpNext: false,
	finishDate: null,
	sureFinishCount: 0,
	probableFinishCount: 0,
	trackedPlayTimeMinutes: 0,
	estimatedPlayTimeMinutes: 0,
	rating: null,
	comment: null,
	doneDlcIds: [],
};

describe("computeUserGameAggregates.ts", () => {
	describe("a single played version", () => {
		it("SHOULD show its own data", () => {
			expect(
				computeUserGameAggregates(
					[
						{
							status: StatusEnum.FINISHED,
							isOwned: true,
							isUpNext: false,
							finishDate: "2013-09-20",
							sureFinishCount: 1,
							probableFinishCount: 2,
							trackedPlayTimeMinutes: 600,
							estimatedPlayTimeMinutes: 90,
							rating: 18,
							comment: "Excellent",
							doneDlcIds: [11],
						},
					],
					[11, 12],
				),
			).toStrictEqual({
				status: StatusEnum.FINISHED,
				isOwned: true,
				isUpNext: false,
				finishDate: "2013-09-20",
				sureFinishCount: 1,
				probableFinishCount: 2,
				doneDlcCount: 1,
				dlcCount: 2,
				trackedPlayTimeMinutes: 600,
				estimatedPlayTimeMinutes: 90,
				totalPlayTimeMinutes: 690,
				rating: 18,
				comment: "Excellent",
			});
		});
	});

	describe("several played versions", () => {
		const aggregates = computeUserGameAggregates(
			[
				{
					...BLANK_USER_VERSION,
					status: StatusEnum.FINISHED,
					finishDate: "2014-01-05",
					sureFinishCount: 1,
					trackedPlayTimeMinutes: 120,
					rating: 12,
					comment: "PS3",
					doneDlcIds: [11, 99],
				},
				{
					...BLANK_USER_VERSION,
					status: StatusEnum.STARTED,
					isUpNext: true,
					finishDate: "2012-03-01",
					sureFinishCount: 2,
					estimatedPlayTimeMinutes: 30,
					rating: 16,
					comment: "PC",
					doneDlcIds: [11, 12],
				},
			],
			[11, 12, 13],
		);

		it("SHOULD sum the counters and the times", () => {
			expect(aggregates).toMatchObject({
				sureFinishCount: 3,
				trackedPlayTimeMinutes: 120,
				estimatedPlayTimeMinutes: 30,
				totalPlayTimeMinutes: 150,
			});
		});

		it("SHOULD keep the earliest finish date, the highest rating and the best status", () => {
			expect(aggregates).toMatchObject({
				finishDate: "2012-03-01",
				rating: 16,
				status: StatusEnum.FINISHED,
			});
		});

		it("SHOULD count a DLC once WHEN it is done on several versions, ignoring DLC of another game", () => {
			expect(aggregates).toMatchObject({ doneDlcCount: 2, dlcCount: 3 });
		});

		it("SHOULD check a box WHEN at least one version checks it", () => {
			expect(aggregates).toMatchObject({ isUpNext: true, isOwned: false });
		});

		it("SHOULD show no comment WHEN several versions have one", () => {
			expect(aggregates.comment).toBeNull();
		});
	});
});
