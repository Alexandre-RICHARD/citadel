import { MediaColumnEnum } from "@citadel/specs/src/projects/backlog/enum/mediaColumn.enum";
import { NasColumnEnum } from "@citadel/specs/src/projects/backlog/enum/nasColumn.enum";
import { describe, expect, it } from "vitest";

import { isNasColumn } from "./isNasColumn";

describe("isNasColumn.ts", () => {
	describe("columns", () => {
		it("SHOULD recognize a NAS column", () => {
			expect(isNasColumn(NasColumnEnum.STORAGE)).toBe(true);
		});

		it("SHOULD not take a common column for a NAS one", () => {
			expect(isNasColumn(MediaColumnEnum.WATCHED)).toBe(false);
		});
	});
});
