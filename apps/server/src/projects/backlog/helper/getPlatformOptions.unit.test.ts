import { SubPlatformTypeEnum } from "@citadel/specs/src/projects/backlog/enum/subPlatformType.enum.ts";
import { describe, expect, it } from "vitest";

import { getPlatformOptions } from "./getPlatformOptions.ts";

const PS2 = {
	id: 8,
	shortName: "PS2",
	technicalName: "ps2",
	parentPlatformId: null,
	subPlatformType: null,
};
const PS3 = {
	id: 9,
	shortName: "PS3",
	technicalName: "ps3",
	parentPlatformId: null,
	subPlatformType: null,
};
const PCSX2 = {
	id: -1,
	shortName: "PCSX2",
	technicalName: "pcsx2",
	parentPlatformId: 8,
	subPlatformType: SubPlatformTypeEnum.EMULATOR,
};
const PC = {
	id: 6,
	shortName: "PC",
	technicalName: "win",
	parentPlatformId: null,
	subPlatformType: null,
};
const STEAM = {
	id: -3,
	shortName: "Steam",
	technicalName: "steam",
	parentPlatformId: 6,
	subPlatformType: SubPlatformTypeEnum.LAUNCHER,
};
const RPCS3 = {
	id: -2,
	shortName: "RPCS3",
	technicalName: "rpcs3",
	parentPlatformId: 9,
	subPlatformType: SubPlatformTypeEnum.EMULATOR,
};

describe("getPlatformOptions.ts", () => {
	describe("options", () => {
		it("SHOULD offer the version platforms, then the sub-platforms of these platforms", () => {
			expect(getPlatformOptions([PS2], [PCSX2, RPCS3])).toStrictEqual([
				PS2,
				PCSX2,
			]);
		});

		it("SHOULD offer the launchers of the PC, with the emulators of the other platforms", () => {
			expect(
				getPlatformOptions([PC, PS3], [PCSX2, RPCS3, STEAM]),
			).toStrictEqual([PC, PS3, RPCS3, STEAM]);
		});

		it("SHOULD offer no sub-platform WHEN none depends on the platforms", () => {
			expect(getPlatformOptions([PS3], [PCSX2, STEAM])).toStrictEqual([PS3]);
		});
	});
});
