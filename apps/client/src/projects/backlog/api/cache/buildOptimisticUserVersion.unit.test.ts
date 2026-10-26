import type { StoredGameDto } from "@citadel/specs/src/projects/backlog/dto/game/storedGameDto.type";
import type { CreateUserVersionBodyDto } from "@citadel/specs/src/projects/backlog/endpoint/userVersions/createUserVersion/createUserVersionBodyDto.type";
import { StatusEnum } from "@citadel/specs/src/projects/backlog/enum/status.enum";
import { describe, expect, it } from "vitest";

import { PCSX2_PLATFORM } from "../testUtils/pcsx2Platform";
import { PS2_PLATFORM } from "../testUtils/ps2Platform";
import { buildOptimisticUserVersion } from "./buildOptimisticUserVersion";

const STORED_GAME: StoredGameDto = {
	id: 100,
	name: "Ico",
	frenchName: null,
	firstReleaseDate: "2001-09-24",
	isCancelled: false,
	igdbUrl: "https://www.igdb.com/games/ico",
	proposedSeries: null,
	developer: null,
	publisher: null,
	versions: [
		{
			id: 100,
			title: null,
			coverImageId: "cover100",
			igdbUrl: "https://www.igdb.com/games/ico",
			platforms: [{ platform: PS2_PLATFORM, releaseDate: "2001-09-24" }],
			platformOptions: [PS2_PLATFORM, PCSX2_PLATFORM],
		},
	],
	dlcs: [],
	customization: null,
};

const BODY: CreateUserVersionBodyDto = {
	versionId: 100,
	platformId: 8,
	status: StatusEnum.STARTED,
	isOwned: true,
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

describe("buildOptimisticUserVersion.ts", () => {
	describe("known version and platform", () => {
		it("SHOULD build the user version with the temporary id and the release on its platform", () => {
			expect(buildOptimisticUserVersion(STORED_GAME, BODY, -4)).toStrictEqual({
				id: -4,
				version: {
					id: 100,
					title: null,
					coverImageId: "cover100",
					igdbUrl: "https://www.igdb.com/games/ico",
				},
				platform: PS2_PLATFORM,
				releaseDate: "2001-09-24",
				status: StatusEnum.STARTED,
				isOwned: true,
				isUpNext: false,
				finishDate: null,
				sureFinishCount: 0,
				probableFinishCount: 0,
				trackedPlayTimeMinutes: 0,
				estimatedPlayTimeMinutes: 0,
				rating: null,
				comment: null,
				doneDlcIds: [],
			});
		});

		it("SHOULD take the release of the emulated console WHEN the platform is an emulator", () => {
			const userVersion = buildOptimisticUserVersion(
				STORED_GAME,
				{ ...BODY, platformId: -1 },
				-4,
			);

			expect(userVersion?.platform).toStrictEqual(PCSX2_PLATFORM);
			expect(userVersion?.releaseDate).toBe("2001-09-24");
		});

		it("SHOULD count a first finish WHEN the status is finished and the count is 0", () => {
			const userVersion = buildOptimisticUserVersion(
				STORED_GAME,
				{ ...BODY, status: StatusEnum.FINISHED },
				-4,
			);

			expect(userVersion?.sureFinishCount).toBe(1);
		});
	});

	describe("unknown version or platform", () => {
		it("SHOULD return null WHEN the version is not in the cached game", () => {
			expect(
				buildOptimisticUserVersion(
					STORED_GAME,
					{ ...BODY, versionId: 999 },
					-4,
				),
			).toBeNull();
		});

		it("SHOULD return null WHEN the platform is not offered for the version", () => {
			expect(
				buildOptimisticUserVersion(STORED_GAME, { ...BODY, platformId: 6 }, -4),
			).toBeNull();
		});
	});
});
