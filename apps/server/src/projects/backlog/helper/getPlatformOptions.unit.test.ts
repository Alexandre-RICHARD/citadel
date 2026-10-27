import { describe, expect, it } from "vitest";

import { getPlatformOptions } from "./getPlatformOptions.ts";

const PS2 = {
	id: 8,
	shortName: "PS2",
	technicalName: "ps2",
	emulatedPlatformId: null,
};
const PS3 = {
	id: 9,
	shortName: "PS3",
	technicalName: "ps3",
	emulatedPlatformId: null,
};
const PCSX2 = {
	id: -1,
	shortName: "PCSX2",
	technicalName: "pcsx2",
	emulatedPlatformId: 8,
};
const RPCS3 = {
	id: -2,
	shortName: "RPCS3",
	technicalName: "rpcs3",
	emulatedPlatformId: 9,
};

describe("getPlatformOptions.ts", () => {
	describe("options", () => {
		it("SHOULD offer the version platforms, then the emulators of these consoles", () => {
			expect(getPlatformOptions([PS2], [PCSX2, RPCS3])).toStrictEqual([
				PS2,
				PCSX2,
			]);
		});

		it("SHOULD offer no emulator WHEN none emulates the platforms", () => {
			expect(getPlatformOptions([PS3], [PCSX2])).toStrictEqual([PS3]);
		});
	});
});
