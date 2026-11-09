import { SubPlatformTypeEnum } from "@citadel/specs/src/projects/backlog/enum/subPlatformType.enum";
import { describe, expect, it } from "vitest";

import type { PlatformFm } from "../../api/model/platformFm.type";
import { getSubPlatformFieldLabel } from "./getSubPlatformFieldLabel";

function buildSubPlatform(subPlatformType: SubPlatformTypeEnum): PlatformFm {
	return {
		id: -1,
		shortName: "Sub",
		technicalName: "sub",
		parentPlatformId: 1,
		subPlatformType,
	};
}

describe("getSubPlatformFieldLabel.ts", () => {
	describe("types", () => {
		it.each([
			{
				reason: "only emulators",
				types: [SubPlatformTypeEnum.EMULATOR],
				label: "Émulateur",
			},
			{
				reason: "only launchers",
				types: [SubPlatformTypeEnum.LAUNCHER, SubPlatformTypeEnum.LAUNCHER],
				label: "Launcher",
			},
			{
				reason: "both",
				types: [SubPlatformTypeEnum.EMULATOR, SubPlatformTypeEnum.LAUNCHER],
				label: "Émulateur ou launcher",
			},
		])("SHOULD be $label WHEN there are $reason", ({ types, label }) => {
			expect(getSubPlatformFieldLabel(types.map(buildSubPlatform))).toBe(label);
		});
	});
});
