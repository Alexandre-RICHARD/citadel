import { StatusEnum } from "@citadel/specs/src/projects/backlog/enum/status.enum";
import { describe, expect, it } from "vitest";

import { buildUserGameDto } from "../testUtils/buildUserGameDto";
import { buildUserVersionDto } from "../testUtils/buildUserVersionDto";
import { PCSX2_PLATFORM } from "../testUtils/pcsx2Platform";
import { PS2_PLATFORM } from "../testUtils/ps2Platform";
import { fromUserGameDtoToBacklogRowFm } from "./fromUserGameDtoToBacklogRowFm";

const DLCS = [
	{ id: 201, name: "First DLC" },
	{ id: 202, name: "Second DLC" },
];

describe("fromUserGameDtoToBacklogRowFm.ts", () => {
	describe("single user version", () => {
		it("SHOULD show the version title and the platform of the user version on the game row", () => {
			const row = fromUserGameDtoToBacklogRowFm(
				buildUserGameDto(1, {
					userVersions: [
						buildUserVersionDto(10, {
							version: {
								id: 101,
								title: "Director's Cut",
								coverImageId: null,
								igdbUrl: "https://www.igdb.com/games/game-101",
							},
						}),
					],
				}),
			);

			expect(row.versionTitle).toBe("Director's Cut");
			expect(row.platform).toStrictEqual(PS2_PLATFORM);
		});
	});

	describe("several user versions", () => {
		it("SHOULD aggregate the user versions on the game row", () => {
			const row = fromUserGameDtoToBacklogRowFm(
				buildUserGameDto(1, {
					dlcs: DLCS,
					userVersions: [
						buildUserVersionDto(10, {
							status: StatusEnum.STARTED,
							isOwned: true,
							finishDate: "2020-05-01",
							sureFinishCount: 1,
							trackedPlayTimeMinutes: 60,
							rating: 12,
							comment: "Too slow",
							doneDlcIds: [201],
						}),
						buildUserVersionDto(11, {
							platform: PCSX2_PLATFORM,
							status: StatusEnum.FINISHED,
							finishDate: "2019-02-10",
							sureFinishCount: 2,
							estimatedPlayTimeMinutes: 30,
							rating: 16,
							doneDlcIds: [201],
						}),
					],
				}),
			);

			expect(row).toMatchObject({
				status: StatusEnum.FINISHED,
				isOwned: true,
				isUpNext: false,
				finishDate: "2019-02-10",
				sureFinishCount: 3,
				doneDlcCount: 1,
				dlcCount: 2,
				totalPlayTimeMinutes: 90,
				rating: 16,
				comment: "Too slow",
				versionTitle: null,
				platform: null,
			});
		});
	});

	describe("user version rows", () => {
		it("SHOULD give each user version its own done DLC count and total play time", () => {
			const [userVersionRow] = fromUserGameDtoToBacklogRowFm(
				buildUserGameDto(1, {
					dlcs: DLCS,
					userVersions: [
						buildUserVersionDto(10, {
							doneDlcIds: [201, 202],
							trackedPlayTimeMinutes: 45,
							estimatedPlayTimeMinutes: 15,
						}),
					],
				}),
			).userVersionRows;

			expect(userVersionRow).toMatchObject({
				userVersionId: 10,
				versionId: 100,
				doneDlcCount: 2,
				dlcCount: 2,
				totalPlayTimeMinutes: 60,
				igdbUrl: "https://www.igdb.com/games/game-100",
				isTemporary: false,
			});
		});
	});

	describe("optimistic rows", () => {
		it("SHOULD flag the game row as temporary WHEN all its user versions wait for the server", () => {
			const row = fromUserGameDtoToBacklogRowFm(
				buildUserGameDto(1, { userVersions: [buildUserVersionDto(-3)] }),
			);

			expect(row.isTemporary).toBe(true);
		});

		it("SHOULD keep the game row active WHEN only an added user version waits for the server", () => {
			const row = fromUserGameDtoToBacklogRowFm(
				buildUserGameDto(1, {
					userVersions: [buildUserVersionDto(10), buildUserVersionDto(-3)],
				}),
			);

			expect(row.isTemporary).toBe(false);
			expect(
				row.userVersionRows.map(({ isTemporary }) => isTemporary),
			).toStrictEqual([false, true]);
		});
	});
});
