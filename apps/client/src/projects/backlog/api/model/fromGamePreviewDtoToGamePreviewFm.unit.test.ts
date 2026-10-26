import type { GamePreviewDto } from "@citadel/specs/src/projects/backlog/dto/igdb/gamePreviewDto.type";
import { describe, expect, it } from "vitest";

import { PS2_PLATFORM } from "../testUtils/ps2Platform";
import { fromGamePreviewDtoToGamePreviewFm } from "./fromGamePreviewDtoToGamePreviewFm";

function buildVersion(id: number, title: string | null) {
	return {
		id,
		title,
		coverImageId: null,
		igdbUrl: `https://www.igdb.com/games/game-${id}`,
		isStored: false,
		platforms: [{ platform: PS2_PLATFORM, releaseDate: "2001-12-03" }],
		platformOptions: [PS2_PLATFORM],
	};
}

const PREVIEW: GamePreviewDto = {
	game: {
		id: 100,
		name: "Ico",
		frenchName: null,
		firstReleaseDate: "2001-09-24",
		isCancelled: false,
		igdbUrl: "https://www.igdb.com/games/ico",
	},
	isStored: false,
	proposedSeriesName: "Team Ico",
	developer: { id: 1, name: "Team Ico", logoImageId: null },
	publisher: null,
	versions: [buildVersion(100, null), buildVersion(101, "HD")],
	dlcs: [],
	imageIds: ["cover100"],
	warnings: [
		{
			igdbId: 102,
			name: "Ico & Shadow of the Colossus Collection",
			typeName: "Bundle",
			entryJson: "{}",
		},
	],
};

describe("fromGamePreviewDtoToGamePreviewFm.ts", () => {
	describe("versions", () => {
		it("SHOULD flag the original version, always stored with the game", () => {
			const preview = fromGamePreviewDtoToGamePreviewFm(PREVIEW);

			expect(
				preview.versions.map(({ isOriginal }) => isOriginal),
			).toStrictEqual([true, false]);
		});
	});

	describe("warnings", () => {
		it("SHOULD explain in French why an IGDB entry is ignored", () => {
			const [warning] = fromGamePreviewDtoToGamePreviewFm(PREVIEW).warnings;

			expect(warning).toStrictEqual({
				igdbId: 102,
				message:
					"« Ico & Shadow of the Colossus Collection » est rattaché comme version, mais son type est « Bundle » : fiche ignorée.",
				entryJson: "{}",
			});
		});
	});
});
