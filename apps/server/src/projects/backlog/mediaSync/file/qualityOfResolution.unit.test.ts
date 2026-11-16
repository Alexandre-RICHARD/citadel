import { NasQualityEnum } from "@citadel/specs/src/projects/backlog/enum/nasQuality.enum.ts";
import { describe, expect, it } from "vitest";

import { qualityOfResolution } from "./qualityOfResolution.ts";

describe("qualityOfResolution.ts", () => {
	describe("best measure", () => {
		it("SHOULD keep the width of a cropped movie and the height of a 4:3 episode", () => {
			expect(qualityOfResolution(1920, 800)).toBe(NasQualityEnum.FHD);
			expect(qualityOfResolution(1440, 1080)).toBe(NasQualityEnum.FHD);
		});

		it("SHOULD find 4K and SD", () => {
			expect(qualityOfResolution(3840, 1600)).toBe(NasQualityEnum.UHD);
			expect(qualityOfResolution(720, 576)).toBe(NasQualityEnum.SD);
		});
	});
});
