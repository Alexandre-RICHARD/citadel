import { NasGapKindEnum } from "@citadel/specs/src/projects/backlog/enum/nasGapKind.enum.ts";
import { NasToolEnum } from "@citadel/specs/src/projects/backlog/enum/nasTool.enum.ts";
import { describe, expect, it } from "vitest";

import { buildMismatchGaps } from "./buildMismatchGaps.ts";

const FOLDER = null;

describe("buildMismatchGaps.ts", () => {
	describe("no gap", () => {
		it("SHOULD find nothing WHEN every source agrees with the backlog", () => {
			expect(
				buildMismatchGaps(
					{ tmdbId: 603, toolTmdbId: 603, jellyfinTmdbId: 603, folder: FOLDER },
					603,
					NasToolEnum.RADARR,
					true,
				),
			).toStrictEqual([]);
		});

		it("SHOULD ignore Jellyfin WHEN it does not have the file", () => {
			expect(
				buildMismatchGaps(
					{
						tmdbId: 603,
						toolTmdbId: 603,
						jellyfinTmdbId: null,
						folder: FOLDER,
					},
					603,
					NasToolEnum.RADARR,
					false,
				),
			).toStrictEqual([]);
		});
	});

	describe("gaps", () => {
		it("SHOULD report the tool and Jellyfin WHEN they give other identifiers", () => {
			expect(
				buildMismatchGaps(
					{
						tmdbId: 999,
						toolTmdbId: 999,
						jellyfinTmdbId: null,
						folder: FOLDER,
					},
					603,
					NasToolEnum.RADARR,
					true,
				),
			).toStrictEqual([
				{
					kind: NasGapKindEnum.TOOL_MISMATCH,
					tool: NasToolEnum.RADARR,
					tmdbId: 999,
				},
				{ kind: NasGapKindEnum.JELLYFIN_MISMATCH, tmdbId: null },
			]);
		});
	});
});
