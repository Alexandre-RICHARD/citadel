import { SubPlatformTypeEnum } from "@citadel/specs/src/projects/backlog/enum/subPlatformType.enum";
import { describe, expect, it } from "vitest";

import type { PlatformFm } from "../../api/model/platformFm.type";
import { splitPlatformChoice } from "./splitPlatformChoice";

function buildPlatform(
	id: number,
	shortName: string,
	parentPlatformId: number | null = null,
	subPlatformType: SubPlatformTypeEnum | null = null,
): PlatformFm {
	return {
		id,
		shortName,
		technicalName: shortName.toLowerCase(),
		parentPlatformId,
		subPlatformType,
	};
}

const PS3 = buildPlatform(9, "PS3");
const PC = buildPlatform(6, "PC");
const RPCS3 = buildPlatform(-2, "RPCS3", 9, SubPlatformTypeEnum.EMULATOR);
const STEAM = buildPlatform(-3, "Steam", 6, SubPlatformTypeEnum.LAUNCHER);
const EPIC = buildPlatform(-4, "Epic", 6, SubPlatformTypeEnum.LAUNCHER);
const OPTIONS = [PS3, PC, RPCS3, STEAM, EPIC];

describe("splitPlatformChoice.ts", () => {
	describe("no choice yet", () => {
		it("SHOULD offer the platforms alone, and no sub-platform", () => {
			expect(splitPlatformChoice(OPTIONS, null)).toStrictEqual({
				platforms: [PS3, PC],
				parentId: null,
				subPlatforms: [],
				subPlatformId: null,
			});
		});
	});

	describe("a platform chosen", () => {
		it("SHOULD offer its sub-platforms WHEN it has some, none chosen", () => {
			expect(splitPlatformChoice(OPTIONS, PC.id)).toStrictEqual({
				platforms: [PS3, PC],
				parentId: PC.id,
				subPlatforms: [STEAM, EPIC],
				subPlatformId: null,
			});
		});

		it("SHOULD offer no sub-platform WHEN it has none", () => {
			const choice = splitPlatformChoice([PS3, PC, STEAM], PS3.id);

			expect(choice.subPlatforms).toStrictEqual([]);
			expect(choice.parentId).toBe(PS3.id);
		});
	});

	describe("a sub-platform chosen", () => {
		it("SHOULD show its platform as the first choice and itself as the second", () => {
			expect(splitPlatformChoice(OPTIONS, STEAM.id)).toStrictEqual({
				platforms: [PS3, PC],
				parentId: PC.id,
				subPlatforms: [STEAM, EPIC],
				subPlatformId: STEAM.id,
			});
		});
	});

	describe("platform out of the options", () => {
		it("SHOULD behave as no choice", () => {
			expect(splitPlatformChoice(OPTIONS, 12345)).toMatchObject({
				parentId: null,
				subPlatforms: [],
				subPlatformId: null,
			});
		});
	});
});
