import { NasGapKindEnum } from "@citadel/specs/src/projects/backlog/enum/nasGapKind.enum";
import { NasToolEnum } from "@citadel/specs/src/projects/backlog/enum/nasTool.enum";
import { describe, expect, it } from "vitest";

import { describeNasGap } from "./describeNasGap";

describe("describeNasGap.ts", () => {
	describe("gaps citing an id", () => {
		it("SHOULD name the tool and give the TMDB ID it links the file to", () => {
			expect(
				describeNasGap({
					kind: NasGapKindEnum.TOOL_MISMATCH,
					tool: NasToolEnum.RADARR,
					tmdbId: 604,
				}),
			).toStrictEqual({ text: "Fiche Radarr différente : TMDB", tmdbId: 604 });
		});
	});

	describe("gaps without id", () => {
		it.each([
			{
				gap: { kind: NasGapKindEnum.DUPLICATE, fileCount: 3 } as const,
				text: "Doublon : 3 fichiers",
			},
			{
				gap: { kind: NasGapKindEnum.JELLYFIN_MISMATCH, tmdbId: null } as const,
				text: "Fiche Jellyfin sans identifiant TMDB",
			},
		])("SHOULD say $text", ({ gap, text }) => {
			expect(describeNasGap(gap)).toStrictEqual({ text, tmdbId: null });
		});
	});
});
